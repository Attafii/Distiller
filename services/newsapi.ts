import "server-only";

import { fetchWithTimeout } from "@/lib/http";
import { buildGlobalQuery, getDateRangeCutoff, NEWSAPI_CATEGORY_MAP } from "@/lib/news-options";
import { normalizeEnvString } from "@/lib/utils";
import type { Category, CountryCode, DateRange, NewsArticle } from "@/types/news";

const NEWS_BASE_URL = normalizeEnvString(process.env.NEWSAPI_BASE_URL, "https://newsapi.org/v2").replace(/\/$/, "");
const NEWS_API_KEY = normalizeEnvString(process.env.NEWSAPI_KEY);
const NEWS_COUNTRY = normalizeEnvString(process.env.NEWS_COUNTRY, "us");

export class NewsApiError extends Error {
  constructor(message: string, public readonly statusCode = 500) {
    super(message);
    this.name = "NewsApiError";
  }
}

export interface FetchNewsArticlesInput {
  category: Category;
  page: number;
  pageSize: number;
  country?: CountryCode;
  dateRange?: DateRange;
  query?: string;
}

interface NewsApiPayloadArticle {
  source?: { id?: string | null; name?: string };
  title?: string | null;
  description?: string | null;
  content?: string | null;
  url?: string;
  urlToImage?: string | null;
  publishedAt?: string;
}

type DemoArticleSeed = Pick<NewsArticle, "title" | "description" | "content" | "url" | "imageUrl">;

const demoDeck: Record<Category, Array<DemoArticleSeed>> = {
  world: [
    {
      title: "Diplomats widen talks as regional supply chains shift",
      description: "Negotiators are trying to limit disruption while trade flows are rerouted.",
      content:
        "Regional governments are coordinating on shipping routes, customs changes, and emergency procurement as geopolitical pressure changes trade patterns.",
      url: "https://example.com/distiller/world/diplomacy-supply-chains",
      imageUrl: null
    },
    {
      title: "International agencies track humanitarian needs after heavy flooding",
      description: "Aid groups are prioritizing transport access and medical support.",
      content:
        "Response teams are mapping access roads, power availability, and mobile clinics to keep relief moving after the flooding damaged critical infrastructure.",
      url: "https://example.com/distiller/world/flood-response",
      imageUrl: null
    },
    {
      title: "Summit leaders press for stricter climate funding commitments",
      description: "The talks are centered on financing and measurable timelines.",
      content:
        "Delegates are debating how to align finance pledges, adaptation targets, and accountability measures ahead of the next climate deadline.",
      url: "https://example.com/distiller/world/climate-funding",
      imageUrl: null
    }
  ],
  tech: [
    {
      title: "Open-source AI copilots move deeper into newsroom workflows",
      description: "Editorial teams are using retrieval-first assistants to keep summaries grounded and fast.",
      content:
        "Newsrooms are testing AI copilots that summarize long briefs, pull direct source quotes, and highlight factual changes before publication. The strongest systems keep retrieval and verification separate from generation.",
      url: "https://example.com/distiller/tech/open-source-copilots",
      imageUrl: null
    },
    {
      title: "Browser-side privacy tooling gains adoption in consumer apps",
      description: "Teams are moving more sensitive filtering logic closer to the user interface.",
      content:
        "Product teams are shipping lighter client-side privacy controls that reduce the amount of personally identifiable data sent upstream while preserving useful personalization.",
      url: "https://example.com/distiller/tech/privacy-tooling",
      imageUrl: null
    },
    {
      title: "Inference routing becomes a first-class product decision",
      description: "Developers are splitting prompts across multiple model tiers based on task complexity.",
      content:
        "Routing short queries to smaller models and harder tasks to larger ones is becoming a core optimization strategy for cost and latency control in production AI systems.",
      url: "https://example.com/distiller/tech/inference-routing",
      imageUrl: null
    }
  ],
  science: [
    {
      title: "Researchers refine climate models with higher-resolution satellite data",
      description: "Improved measurements are reducing uncertainty in local weather projection bands.",
      content:
        "A new generation of climate models uses higher-resolution satellite observations to better estimate regional shifts in rainfall and heat persistence.",
      url: "https://example.com/distiller/science/climate-models",
      imageUrl: null
    },
    {
      title: "Lab studies show how aging affects cellular repair pathways",
      description: "The findings may inform future treatments for age-related degeneration.",
      content:
        "Scientists observed slower repair signaling in older cells, helping explain why recovery pathways become less efficient with age.",
      url: "https://example.com/distiller/science/cellular-repair",
      imageUrl: null
    },
    {
      title: "Ocean chemistry analysis finds faster-than-expected acidification in some regions",
      description: "Coastal monitoring programs are being expanded to track the trend.",
      content:
        "The study found pockets of faster acidification in heavily industrialized waterways, prompting updated monitoring priorities.",
      url: "https://example.com/distiller/science/ocean-chemistry",
      imageUrl: null
    }
  ],
  business: [
    {
      title: "Global markets watch earnings calls for signs of demand stabilization",
      description: "Investors are looking for margin recovery and inventory normalization.",
      content:
        "Analysts are focusing on guidance around demand, pricing discipline, and supply-chain normalization as the next quarter approaches.",
      url: "https://example.com/distiller/business/earnings-calls",
      imageUrl: null
    },
    {
      title: "Logistics firms invest in automation to reduce delivery volatility",
      description: "Warehouses are prioritizing software that improves throughput and accuracy.",
      content:
        "Executives say automation budgets are being redirected toward systems that cut routing delays and lower operational variance.",
      url: "https://example.com/distiller/business/logistics-automation",
      imageUrl: null
    },
    {
      title: "Consumer brands lean on disciplined pricing to protect growth",
      description: "Companies are balancing volume pressure against margin preservation.",
      content:
        "Several consumer brands are holding prices steady while reducing SKU complexity and focusing on profitable categories.",
      url: "https://example.com/distiller/business/pricing-discipline",
      imageUrl: null
    }
  ],
  health: [
    {
      title: "Hospitals expand outpatient triage to ease emergency bottlenecks",
      description: "Clinics are shifting lower-acuity cases away from crowded ERs.",
      content:
        "Health systems are adding rapid triage stations, digital intake, and same-day referrals to cut waiting-room pressure and speed care.",
      url: "https://example.com/distiller/health/triage-bottlenecks",
      imageUrl: null
    },
    {
      title: "Researchers test a new approach for tracking viral variants early",
      description: "Wastewater and sequencing signals are being combined into one pipeline.",
      content:
        "The new surveillance method blends wastewater sampling, clinical sequencing, and forecasting to detect variant shifts before hospital data spikes.",
      url: "https://example.com/distiller/health/variant-surveillance",
      imageUrl: null
    },
    {
      title: "Nutrition studies focus on simpler guidance for metabolic health",
      description: "The findings emphasize consistency over extreme diet swings.",
      content:
        "Researchers are finding that repeatable meal patterns and sleep routines may matter more than short-lived diet experiments for long-term outcomes.",
      url: "https://example.com/distiller/health/nutrition-guidance",
      imageUrl: null
    }
  ],
  sports: [
    {
      title: "Teams lean harder on analytics to manage late-season fatigue",
      description: "Coaches are using workload data to adjust rotation decisions.",
      content:
        "Performance staff are monitoring workload spikes, recovery windows, and travel schedules to protect players before playoff runs.",
      url: "https://example.com/distiller/sports/workload-analytics",
      imageUrl: null
    },
    {
      title: "League organizers revisit broadcast windows for global audiences",
      description: "The goal is balancing local attendance with international viewership.",
      content:
        "Broadcast partners are testing new kickoff times to improve international viewership without hurting live gate attendance.",
      url: "https://example.com/distiller/sports/broadcast-windows",
      imageUrl: null
    },
    {
      title: "Young prospects are getting earlier paths into elite competition",
      description: "Clubs are widening development pipelines to keep talent in-house.",
      content:
        "Development programs are accelerating the move from academy systems to first-team minutes as clubs compete to retain top prospects.",
      url: "https://example.com/distiller/sports/prospect-pathways",
      imageUrl: null
    }
  ],
  entertainment: [
    {
      title: "Streaming services shift toward smaller, event-driven releases",
      description: "Studios want a steadier audience response instead of crowded launch weeks.",
      content:
        "Platforms are spacing out premieres and building more around live events, specials, and franchise tentpoles to keep attention longer.",
      url: "https://example.com/distiller/entertainment/event-releases",
      imageUrl: null
    },
    {
      title: "Indie creators are experimenting with tighter, serialized formats",
      description: "Shorter seasons and direct fan feedback are shaping new projects.",
      content:
        "Creators are using compact episode runs and iterative release schedules to keep production lean and audience feedback fast.",
      url: "https://example.com/distiller/entertainment/serialized-formats",
      imageUrl: null
    },
    {
      title: "Live music tours are blending digital drops with venue demand",
      description: "Promoters want to convert online hype into ticket sales.",
      content:
        "Artists are pairing livestream previews, merch drops, and local venue activations to turn online attention into tour revenue.",
      url: "https://example.com/distiller/entertainment/live-music-tours",
      imageUrl: null
    }
  ]
};

function buildDemoArticles(category: Category): NewsArticle[] {
  const base = demoDeck[category];
  const publishedAtBase = Date.now();

  return base.map((item, index) => ({
    id: `demo-${category}-${index}`,
    title: item.title,
    description: item.description,
    content: item.content,
    url: item.url,
    imageUrl: item.imageUrl,
    publishedAt: new Date(publishedAtBase - index * 90 * 60 * 1000).toISOString(),
    source: {
      id: null,
      name: "Distiller Demo"
    },
    category
  }));
}

function applyDateFilter(articles: NewsArticle[], dateRange?: DateRange): NewsArticle[] {
  const cutoff = dateRange ? getDateRangeCutoff(dateRange) : null;

  if (!cutoff) {
    return articles;
  }

  return articles.filter((article) => new Date(article.publishedAt).getTime() >= cutoff.getTime());
}

function normalizeArticle(article: NewsApiPayloadArticle, category: Category, index: number): NewsArticle | null {
  if (!article.title || !article.url || !article.publishedAt) {
    return null;
  }

  return {
    id: `${article.url}-${index}`,
    title: article.title,
    description: article.description ?? null,
    content: article.content ?? null,
    url: article.url,
    imageUrl: article.urlToImage ?? null,
    publishedAt: article.publishedAt,
    source: {
      id: article.source?.id ?? null,
      name: article.source?.name ?? "Unknown source"
    },
    category
  };
}

async function fetchNewsApi(
  url: string,
  category: Category,
  dateRange?: DateRange
): Promise<{ articles: NewsArticle[]; totalResults: number }> {
  try {
    const response = await fetchWithTimeout(url, {
      cache: "no-store"
    }, 6000);

    if (!response.ok) {
      throw new NewsApiError(`NewsAPI request failed with status ${response.status}`, response.status);
    }

    const payload = (await response.json()) as {
      totalResults?: number;
      articles?: NewsApiPayloadArticle[];
    };

    const normalizedArticles = (payload.articles ?? [])
      .map((article, index) => normalizeArticle(article, category, index))
      .filter((article): article is NewsArticle => Boolean(article));

    const articles = applyDateFilter(normalizedArticles, dateRange);

    if (!articles.length) {
      return {
        articles: buildDemoArticles(category),
        totalResults: buildDemoArticles(category).length
      };
    }

    return {
      articles,
      totalResults: payload.totalResults ?? articles.length
    };
  } catch (error) {
    console.error("NewsAPI fetch failed", {
      category,
      dateRange,
      error: error instanceof Error ? error.message : String(error)
    });

    return {
      articles: buildDemoArticles(category),
      totalResults: buildDemoArticles(category).length
    };
  }
}

export async function fetchNewsArticles({
  category,
  page,
  pageSize,
  query,
  country = NEWS_COUNTRY as CountryCode,
  dateRange = "any"
}: FetchNewsArticlesInput): Promise<{
  articles: NewsArticle[];
  totalResults: number;
}> {
  if (!NEWS_API_KEY) {
    console.warn("NEWSAPI_KEY is missing, using demo articles", { category, country, dateRange });

    return {
      articles: buildDemoArticles(category),
      totalResults: buildDemoArticles(category).length
    };
  }

  const resolvedPage = Math.max(1, page);
  const resolvedPageSize = Math.max(1, Math.min(pageSize, 12));
  const currentCountry = country;
  const currentDateRange = dateRange;
  const useEverything = currentCountry === "global" || Boolean(query?.trim());
  const endpoint = new URL(useEverything ? `${NEWS_BASE_URL}/everything` : `${NEWS_BASE_URL}/top-headlines`);

  if (useEverything) {
    const searchQuery = buildGlobalQuery(category, query);

    if (searchQuery) {
      endpoint.searchParams.set("q", searchQuery);
      endpoint.searchParams.set("searchIn", "title,description,content");
    }

    endpoint.searchParams.set("sortBy", "publishedAt");
    endpoint.searchParams.set("language", "en");

    const cutoff = getDateRangeCutoff(currentDateRange);
    if (cutoff) {
      endpoint.searchParams.set("from", cutoff.toISOString());
    }
  } else {
    endpoint.searchParams.set("country", currentCountry);

    const mappedCategory = NEWSAPI_CATEGORY_MAP[category];
    if (mappedCategory !== "general" || category === "world") {
      endpoint.searchParams.set("category", mappedCategory);
    }

    endpoint.searchParams.set("language", "en");
  }

  endpoint.searchParams.set("page", String(resolvedPage));
  endpoint.searchParams.set("pageSize", String(resolvedPageSize));
  endpoint.searchParams.set("apiKey", NEWS_API_KEY);

  return fetchNewsApi(endpoint.toString(), category, currentDateRange);
}
