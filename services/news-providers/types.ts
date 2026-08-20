import "server-only";

import type { Category, CountryCode, DateRange, NewsArticle } from "@/types/news";

export interface FetchFeedParams {
  category: Category;
  page: number;
  pageSize: number;
  country?: CountryCode;
  dateRange?: DateRange;
  query?: string;
}

export interface NewsProvider {
  readonly id: string;
  readonly name: string;
  fetchHeadlines(params: FetchFeedParams): Promise<NewsArticle[]>;
}

export class ProviderUnavailableError extends Error {
  constructor(
    message: string,
    public readonly providerId: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = "ProviderUnavailableError";
  }
}
