import "server-only";

import { fetchNewsArticles, buildDemoArticles } from "@/services/newsapi";
import type { NewsArticle } from "@/types/news";

import { gnewsProvider } from "./gnews";
import { isProviderAvailable, recordFailure, recordSuccess, isQuotaError } from "./circuit-breaker";
import { ProviderUnavailableError } from "./types";
import type { FetchFeedParams, NewsProvider } from "./types";

// Priority order: NewsAPI (primary) → GNews (fallback)
const providers: NewsProvider[] = [
  {
    id: "newsapi",
    name: "NewsAPI",
    fetchHeadlines: async (params) => {
      const result = await fetchNewsArticles(params);
      if (result._demo) {
        // Demo articles mean the real API failed — treat as unavailable
        throw new ProviderUnavailableError("NewsAPI serving demo articles", "newsapi");
      }
      return result.articles;
    }
  },
  gnewsProvider
];

export async function fetchWithFallback(params: FetchFeedParams): Promise<{
  articles: NewsArticle[];
  provider: string;
}> {
  const errors: Array<{ provider: string; error: string }> = [];

  for (const provider of providers) {
    if (!isProviderAvailable(provider.id)) {
      errors.push({ provider: provider.id, error: "circuit open" });
      continue;
    }

    try {
      const articles = await provider.fetchHeadlines(params);
      recordSuccess(provider.id);
      return { articles, provider: provider.id };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const statusCode =
        error instanceof ProviderUnavailableError ? error.statusCode : undefined;
      const isQuota = statusCode ? isQuotaError(statusCode) : false;

      recordFailure(provider.id, isQuota);
      errors.push({ provider: provider.id, error: message });

      // Continue to next provider
    }
  }

  // All providers failed — fall back to demo articles
  console.warn("[NewsProviders] All providers exhausted, serving demo articles:", errors);
  const demoArticles = buildDemoArticles(params.category ?? "tech");
  return { articles: demoArticles, provider: "demo" };
}
