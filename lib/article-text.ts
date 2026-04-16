import { Readability } from "@mozilla/readability";
import { JSDOM, VirtualConsole } from "jsdom";

import { fetchWithTimeout } from "@/lib/http";

type ArticleTextInput = {
  title: string;
  description: string | null;
  content: string | null;
  url: string;
};

const TRUNCATION_SUFFIX = /\s*\[\+\d+\s+chars\]\s*$/i;

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

async function fetchRemoteArticleText(article: ArticleTextInput): Promise<string> {
  const attemptTimeouts = [12000, 16000];
  let lastError: unknown = null;

  for (const timeoutMs of attemptTimeouts) {
    let response: Response;

    try {
      response = await fetchWithTimeout(
        article.url,
        {
          cache: "no-store",
          headers: BROWSER_LIKE_HEADERS,
          redirect: "follow"
        },
        timeoutMs
      );
    } catch (error) {
      lastError = error;
      continue;
    }

    if (!response.ok) {
      if (response.status >= 500 && timeoutMs !== attemptTimeouts[attemptTimeouts.length - 1]) {
        continue;
      }

      throw new Error(`Source request failed with status ${response.status}`);
    }

    const html = await response.text();
    const remoteBody = extractReadableArticleText(html, article.url, article.title);

    return [article.title, article.description, remoteBody]
      .filter((value): value is string => Boolean(value && value.trim()))
      .join("\n\n")
      .trim();
  }

  if (lastError instanceof Error) {
    throw lastError;
  }

  throw new Error("Unable to fetch a readable article body");
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

  try {
    const remoteText = await fetchRemoteArticleText(article);

    if (remoteText.length >= localText.length) {
      return {
        fullText: remoteText,
        source: "remote" as const,
        hadTruncation
      };
    }
  } catch (error) {
    console.warn("Unable to fetch article full text", {
      articleUrl: article.url,
      error: error instanceof Error ? error.message : String(error)
    });
  }

  return {
    fullText: localText,
    source: "feed" as const,
    hadTruncation
  };
}