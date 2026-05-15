import { Readability } from "@mozilla/readability";
import { JSDOM, VirtualConsole } from "jsdom";

import { fetchWithTimeout } from "@/lib/http";
import { normalizeEnvString } from "@/lib/utils";

import type { ArticleTextSource } from "@/types/news";

type ArticleTextInput = {
  title: string;
  description: string | null;
  content: string | null;
  url: string;
};

type CachedArticleText = {
  fullText: string;
  source: Exclude<ArticleTextSource, "feed">;
  fetchedAt: number;
};

const TRUNCATION_SUFFIX = /\s*\[\+\d+\s+chars\]\s*$/i;
const ARTICLE_TEXT_PROXY_BASE = normalizeEnvString(process.env.ARTICLE_TEXT_PROXY_BASE, "https://r.jina.ai").replace(/\/$/, "");
const ARTICLE_TEXT_CACHE_TTL_MS = 1000 * 60 * 60 * 24;
const ARTICLE_TEXT_FAILURE_TTL_MS = 1000 * 60 * 10;
const MAX_CACHE_ENTRIES = 120;

const ENTITY_MAP: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“"
};

const SECTION_PATTERNS = [
  /<article\b[^>]*>([\s\S]*?)<\/article>/gi,
  /<main\b[^>]*>([\s\S]*?)<\/main>/gi,
  /<section\b[^>]*itemprop=(?:"articleBody"|'articleBody')[^>]*>([\s\S]*?)<\/section>/gi,
  /<div\b[^>]*class=(?:"[^"]*(?:article|post|story|content|entry|body)[^"]*"|'[^']*(?:article|post|story|content|entry|body)[^']*')[^>]*>([\s\S]*?)<\/div>/gi
];

const PARAGRAPH_PATTERN = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;
const LIST_ITEM_PATTERN = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;
const BOILERPLATE_END_MARKERS = [
  "Contacts",
  "Company Profile",
  "Press Release Actions",
  "Recommended Reading",
  "Explore",
  "Additional Links",
  "About Us",
  "YOU MAY LIKE",
  "READ MORE NEWS ON",
  "Inputs from ANI",
  "Disclaimer:",
  "Exclusive Insights That Matter",
  "Invest Wisely With Smart Market Tools & Investment Ideas",
  "Stay informed anytime, anywhere with ET ePaper",
  "Times Of India Subscription (1 Year)",
  "Enjoy Complimentary Subscriptions From Top Brands",
  "Make profitable decisions with Investment Ideas",
  "Sponsored: learn about this recommendation"
];

const BROWSER_LIKE_HEADERS = {
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
} as const;

const articleTextCache = new Map<string, CachedArticleText>();
const articleTextFailureCache = new Map<string, { failedAt: number; reason: string }>();

function trimCache<T>(cache: Map<string, T>) {
  while (cache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value as string | undefined;

    if (!oldestKey) {
      break;
    }

    cache.delete(oldestKey);
  }
}

function normalizeUrlKey(value: string) {
  return value.trim();
}

function getRecentFailure(articleUrl: string) {
  const key = normalizeUrlKey(articleUrl);
  const failure = articleTextFailureCache.get(key);

  if (!failure) {
    return null;
  }

  if (Date.now() - failure.failedAt > ARTICLE_TEXT_FAILURE_TTL_MS) {
    articleTextFailureCache.delete(key);
    return null;
  }

  return failure;
}

function markFailure(articleUrl: string, reason: string) {
  const key = normalizeUrlKey(articleUrl);
  articleTextFailureCache.set(key, { failedAt: Date.now(), reason });
  trimCache(articleTextFailureCache);
}

function getCachedArticleText(articleUrl: string) {
  const key = normalizeUrlKey(articleUrl);
  const cached = articleTextCache.get(key);

  if (!cached) {
    return null;
  }

  if (Date.now() - cached.fetchedAt > ARTICLE_TEXT_CACHE_TTL_MS) {
    articleTextCache.delete(key);
    return null;
  }

  return cached;
}

function cacheArticleText(articleUrl: string, fullText: string, source: Exclude<ArticleTextSource, "feed">) {
  const key = normalizeUrlKey(articleUrl);
  articleTextCache.set(key, {
    fullText,
    source,
    fetchedAt: Date.now()
  });
  trimCache(articleTextCache);
}

function buildBrowserHeaders(articleUrl: string) {
  let referer: string | undefined;

  try {
    referer = `${new URL(articleUrl).origin}/`;
  } catch {
    referer = undefined;
  }

  const headers: Record<string, string> = {
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "no-cache",
    DNT: "1",
    Pragma: "no-cache",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "cross-site",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
  };

  if (referer) {
    headers.Referer = referer;
  }

  return headers;
}

function buildProxyUrl(articleUrl: string) {
  return `${ARTICLE_TEXT_PROXY_BASE}/http://${articleUrl}`;
}

function getRetryDelayMs(attempt: number) {
  const baseDelay = 450 * 2 ** attempt;
  const jitter = Math.round(Math.random() * 120);
  return baseDelay + jitter;
}

function shouldRetryStatus(status: number) {
  return status === 408 || status === 425 || status === 429 || (status >= 500 && status < 600);
}

function isRetryableFetchError(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") {
    return true;
  }

  if (error instanceof Error) {
    return /(fetch failed|timed out|network|socket|ECONNRESET|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|TLS|certificate|reset)/i.test(error.message);
  }

  return false;
}

function extractProxyArticleText(text: string) {
  const withoutMetadata = text
    .replace(/\r/g, "")
    .replace(/^Warning:.*$/gim, "")
    .replace(/^Title:.*$/gim, "")
    .replace(/^URL Source:.*$/gim, "")
    .replace(/^Published Time:.*$/gim, "")
    .replace(/^Markdown Content:\s*/gim, "");

  return normalizeText(
    withoutMetadata
      .replace(/^#+\s*/gm, "")
      .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
  );
}

async function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function stripTruncationSuffix(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return value.replace(TRUNCATION_SUFFIX, "").trim();
}

function decodeHtmlEntities(value: string) {
  return value.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity) => {
    if (entity.startsWith("#x") || entity.startsWith("#X")) {
      const codePoint = Number.parseInt(entity.slice(2), 16);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
    }

    if (entity.startsWith("#")) {
      const codePoint = Number.parseInt(entity.slice(1), 10);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
    }

    return ENTITY_MAP[entity.toLowerCase()] ?? match;
  });
}

function normalizeText(value: string) {
  return value
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.replace(/[\t\f\v ]+/g, " ").trim())
    .filter(Boolean)
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function htmlFragmentToText(fragment: string) {
  return normalizeText(
    decodeHtmlEntities(
      fragment
        .replace(/<!--([\s\S]*?)-->/g, " ")
        .replace(/<\s*br\s*\/?\s*>/gi, "\n")
        .replace(/<\/?(?:p|div|li|ul|ol|article|main|section|blockquote|figure|figcaption|tr|td|th|h[1-6])\b[^>]*>/gi, "\n")
        .replace(/<\/?(?:script|style|noscript|svg|iframe|template)\b[^>]*>[\s\S]*?<\/?(?:script|style|noscript|svg|iframe|template)>/gi, " ")
        .replace(/<[^>]+>/g, " ")
    )
  );
}

function scoreText(value: string) {
  const paragraphCount = value.split(/\n{2,}/).filter(Boolean).length;
  return value.length + paragraphCount * 160;
}

function trimNewswireStyleBoilerplate(text: string, title: string) {
  const titleIndices: number[] = [];
  let searchIndex = 0;

  while (searchIndex >= 0) {
    const foundIndex = text.indexOf(title, searchIndex);

    if (foundIndex < 0) {
      break;
    }

    titleIndices.push(foundIndex);
    searchIndex = foundIndex + title.length;
  }

  if (titleIndices.length === 0) {
    return text;
  }

  let bestSegment = "";

  for (const titleIndex of titleIndices) {
    const articleText = text.slice(titleIndex).trim();
    const loweredArticleText = articleText.toLowerCase();
    let endIndex = articleText.length;

    for (const marker of BOILERPLATE_END_MARKERS) {
      const markerIndex = loweredArticleText.indexOf(marker.toLowerCase());

      if (markerIndex > 0 && markerIndex < endIndex) {
        endIndex = markerIndex;
      }
    }

    const trimmed = articleText.slice(0, endIndex).trim();

    if (trimmed.length > bestSegment.length) {
      bestSegment = trimmed;
    }
  }

  return bestSegment.length > 0 ? bestSegment : text;
}

function extractBestReadableText(html: string, title: string) {
  const candidates: string[] = [];

  for (const pattern of SECTION_PATTERNS) {
    pattern.lastIndex = 0;

    for (const match of html.matchAll(pattern)) {
      const extracted = htmlFragmentToText(match[1] ?? "");

      if (extracted.length > 200) {
        candidates.push(extracted);
      }
    }
  }

  const paragraphMatches = Array.from(html.matchAll(PARAGRAPH_PATTERN))
    .map((match) => htmlFragmentToText(match[1] ?? ""))
    .filter((text) => text.length > 80);

  if (paragraphMatches.length > 0) {
    candidates.push(paragraphMatches.join("\n\n"));
  }

  const listMatches = Array.from(html.matchAll(LIST_ITEM_PATTERN))
    .map((match) => htmlFragmentToText(match[1] ?? ""))
    .filter((text) => text.length > 40);

  if (listMatches.length > 0) {
    candidates.push(listMatches.join("\n"));
  }

  const wholeDocumentText = htmlFragmentToText(html);
  const anchoredDocumentText = trimNewswireStyleBoilerplate(wholeDocumentText, title);

  if (anchoredDocumentText.length > 200) {
    candidates.push(anchoredDocumentText);
  } else if (wholeDocumentText.length > 200) {
    candidates.push(wholeDocumentText);
  }

  if (candidates.length === 0) {
    candidates.push(wholeDocumentText);
  }

  return candidates.sort((left, right) => scoreText(right) - scoreText(left))[0] ?? "";
}

function extractReadableArticleText(html: string, url: string, title: string) {
  try {
    const virtualConsole = new VirtualConsole();
    virtualConsole.on("jsdomError", () => undefined);

    const dom = new JSDOM(html, {
      url,
      virtualConsole
    });

    try {
      const readability = new Readability(dom.window.document);
      const parsed = readability.parse();
      const readabilityText = normalizeText(
        [parsed?.title ?? title, parsed?.textContent]
          .filter((value): value is string => Boolean(value && value.trim()))
          .join("\n\n")
      );

      if (readabilityText.length > 250) {
        return readabilityText;
      }
    } finally {
      dom.window.close();
    }
  } catch (error) {
    console.warn("Readability extraction failed", {
      articleUrl: url,
      error: error instanceof Error ? error.message : String(error)
    });
  }

  return extractBestReadableText(html, title);
}

async function fetchDirectArticleText(article: ArticleTextInput): Promise<string> {
  const attemptTimeouts = [10000, 14000, 18000];
  let lastError: unknown = null;

  for (let attempt = 0; attempt < attemptTimeouts.length; attempt += 1) {
    const timeoutMs = attemptTimeouts[attempt] ?? attemptTimeouts[attemptTimeouts.length - 1];

    try {
      const response = await fetchWithTimeout(
        article.url,
        {
          cache: "no-store",
          headers: buildBrowserHeaders(article.url),
          redirect: "follow"
        },
        timeoutMs
      );

      if (!response.ok) {
        lastError = new Error(`Source request failed with status ${response.status}`);

        if (!shouldRetryStatus(response.status) || attempt === attemptTimeouts.length - 1) {
          break;
        }

        await sleep(getRetryDelayMs(attempt));
        continue;
      }

      const html = await response.text();
      const remoteBody = extractReadableArticleText(html, article.url, article.title);

      return [article.title, article.description, remoteBody]
        .filter((value): value is string => Boolean(value && value.trim()))
        .join("\n\n")
        .trim();
    } catch (error) {
      lastError = error;

      if (!isRetryableFetchError(error) || attempt === attemptTimeouts.length - 1) {
        break;
      }

      await sleep(getRetryDelayMs(attempt));
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Unable to fetch a readable article body");
}

async function fetchProxyArticleText(article: ArticleTextInput): Promise<string> {
  const attemptTimeouts = [10000, 14000];
  let lastError: unknown = null;

  for (let attempt = 0; attempt < attemptTimeouts.length; attempt += 1) {
    const timeoutMs = attemptTimeouts[attempt] ?? attemptTimeouts[attemptTimeouts.length - 1];

    try {
      const response = await fetchWithTimeout(
        buildProxyUrl(article.url),
        {
          cache: "no-store",
          headers: {
            Accept: "text/plain,text/markdown,text/html;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Cache-Control": "no-cache",
            DNT: "1",
            Pragma: "no-cache",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
          },
          redirect: "follow"
        },
        timeoutMs
      );

      if (!response.ok) {
        lastError = new Error(`Reader proxy request failed with status ${response.status}`);

        if (!shouldRetryStatus(response.status) || attempt === attemptTimeouts.length - 1) {
          break;
        }

        await sleep(getRetryDelayMs(attempt));
        continue;
      }

      const proxyText = extractProxyArticleText(await response.text());

      return [article.title, article.description, proxyText]
        .filter((value): value is string => Boolean(value && value.trim()))
        .join("\n\n")
        .trim();
    } catch (error) {
      lastError = error;

      if (!isRetryableFetchError(error) || attempt === attemptTimeouts.length - 1) {
        break;
      }

      await sleep(getRetryDelayMs(attempt));
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Unable to fetch article through reader proxy");
}

export function buildLocalArticleText(article: Pick<ArticleTextInput, "title" | "description" | "content">) {
  return [article.title, article.description, stripTruncationSuffix(article.content)]
    .filter((value): value is string => Boolean(value && value.trim()))
    .join("\n\n")
    .trim();
}

export async function fetchFullArticleText(article: ArticleTextInput) {
  const localText = buildLocalArticleText(article);
  const hadTruncation = Boolean(article.content && TRUNCATION_SUFFIX.test(article.content));
  const cacheKey = normalizeUrlKey(article.url);

  const cachedText = getCachedArticleText(article.url);
  if (cachedText && cachedText.fullText.length >= localText.length) {
    return {
      fullText: cachedText.fullText,
      source: "cache" as const,
      hadTruncation
    };
  }

  const recentFailure = getRecentFailure(article.url);
  if (recentFailure && !cachedText) {
    return {
      fullText: localText,
      source: "feed" as const,
      hadTruncation
    };
  }

  try {
    const remoteText = await fetchDirectArticleText(article);

    if (remoteText.length >= localText.length) {
      cacheArticleText(cacheKey, remoteText, "remote");
      return {
        fullText: remoteText,
        source: "remote" as const,
        hadTruncation
      };
    }

    markFailure(article.url, "Direct article fetch was shorter than the feed text");

    try {
      const proxyText = await fetchProxyArticleText(article);

      if (proxyText.length >= localText.length) {
        cacheArticleText(cacheKey, proxyText, "proxy");
        return {
          fullText: proxyText,
          source: "proxy" as const,
          hadTruncation
        };
      }

      markFailure(article.url, "Reader proxy text was shorter than the feed text");
    } catch (proxyError) {
      console.warn("Reader proxy fetch failed after a short direct extract", {
        articleUrl: article.url,
        proxyError: proxyError instanceof Error ? proxyError.message : String(proxyError)
      });
    }
  } catch (error) {
    console.warn("Direct article fetch failed", {
      articleUrl: article.url,
      error: error instanceof Error ? error.message : String(error)
    });

    try {
      const proxyText = await fetchProxyArticleText(article);

      if (proxyText.length >= localText.length) {
        cacheArticleText(cacheKey, proxyText, "proxy");
        return {
          fullText: proxyText,
          source: "proxy" as const,
          hadTruncation
        };
      }

      markFailure(article.url, "Reader proxy text was shorter than the feed text");
    } catch (proxyError) {
      const recentCachedText = getCachedArticleText(article.url);

      console.warn("Unable to fetch article full text", {
        articleUrl: article.url,
        directError: error instanceof Error ? error.message : String(error),
        proxyError: proxyError instanceof Error ? proxyError.message : String(proxyError),
        cachedTextAvailable: Boolean(recentCachedText)
      });

      markFailure(
        article.url,
        proxyError instanceof Error ? proxyError.message : String(proxyError) || "Unknown proxy failure"
      );

      if (recentCachedText && recentCachedText.fullText.length >= localText.length) {
        return {
          fullText: recentCachedText.fullText,
          source: "cache" as const,
          hadTruncation
        };
      }
    }
  }

  return {
    fullText: localText,
    source: "feed" as const,
    hadTruncation
  };
}