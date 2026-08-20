import "server-only";

import { classifyArticlePriority } from "@/lib/article-signals";
import { normalizeEnvString } from "@/lib/utils";
import type { Category, CountryCode, NewsArticle } from "@/types/news";

import { isQuotaError } from "./circuit-breaker";
import { ProviderUnavailableError } from "./types";
import type { FetchFeedParams, NewsProvider } from "./types";

const GNEWS_BASE_URL = "https://gnews.io/api/v4";
// ponytail: read env at call time, not module load, so dev HMR picks up changes
function getGnewsKey() { return normalizeEnvString(process.env.GNEWS_API_KEY); }

// GNews categories → our categories
const CATEGORY_MAP: Partial<Record<Category, string>> = {
  world: "world",
  tech: "technology",
  science: "science",
  business: "business",
  health: "health",
  sports: "sports",
  entertainment: "entertainment",
  politics: "nation"
};

// GNews language codes
const COUNTRY_LANG_MAP: Partial<Record<CountryCode, string>> = {
  us: "en",
  gb: "en",
  ca: "en",
  au: "en",
  in: "en",
  de: "de",
  fr: "fr",
  jp: "ja",
  br: "pt",
  ae: "ar",
  global: "en"
};

interface GNewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
}

interface GNewsResponse {
  totalArticles: number;
  articles: GNewsArticle[];
  errors?: string[];
}

function normalizeGNewsArticle(
  raw: GNewsArticle,
  category: Category,
  index: number
): NewsArticle | null {
  if (!raw.title || !raw.url) return null;

  return {
    id: `gnews-${raw.url}-${index}`,
    title: raw.title,
    description: raw.description ?? null,
    content: raw.content ?? raw.description ?? null,
    url: raw.url,
    imageUrl: raw.image ?? null,
    publishedAt: raw.publishedAt ?? new Date().toISOString(),
    source: {
      id: null,
      name: raw.source?.name ?? "Unknown"
    },
    category,
    priority: classifyArticlePriority({
      title: raw.title,
      description: raw.description,
      content: raw.content
    })
  };
}

async function fetchGNews(params: FetchFeedParams): Promise<NewsArticle[]> {
  const GNEWS_API_KEY = getGnewsKey();
  if (!GNEWS_API_KEY) {
    throw new ProviderUnavailableError("GNEWS_API_KEY not configured", "gnews");
  }

  const { category, pageSize, country = "global" } = params;
  const gnewsCategory = CATEGORY_MAP[category];
  const lang = COUNTRY_LANG_MAP[country] ?? "en";

  // GNews top-headlines requires a category
  if (!gnewsCategory) {
    throw new ProviderUnavailableError(`GNews does not support category: ${category}`, "gnews");
  }

  const url = new URL(`${GNEWS_BASE_URL}/top-headlines`);
  url.searchParams.set("category", gnewsCategory);
  url.searchParams.set("lang", lang);
  url.searchParams.set("max", String(Math.min(pageSize, 10))); // GNews free: max 10
  url.searchParams.set("apikey", GNEWS_API_KEY);

  const response = await fetch(url.toString(), { cache: "no-store" });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    const quota = isQuotaError(response.status, body);
    throw new ProviderUnavailableError(
      `GNews request failed: ${response.status}`,
      "gnews",
      response.status
    );
  }

  const data = (await response.json()) as GNewsResponse;

  if (data.errors?.length) {
    throw new ProviderUnavailableError(`GNews errors: ${data.errors.join(", ")}`, "gnews");
  }

  return (data.articles ?? [])
    .map((article, index) => normalizeGNewsArticle(article, category, index))
    .filter((a): a is NewsArticle => Boolean(a));
}

export const gnewsProvider: NewsProvider = {
  id: "gnews",
  name: "GNews",
  fetchHeadlines: fetchGNews
};
