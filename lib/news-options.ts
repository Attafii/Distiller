import type { Category, CountryCode, DateRange } from "@/types/news";

export const TOPIC_OPTIONS: Array<{ id: Category; label: string }> = [
  { id: "world", label: "World" },
  { id: "politics", label: "Politics" },
  { id: "tech", label: "Technology" },
  { id: "ai", label: "AI" },
  { id: "llm", label: "LLM" },
  { id: "science", label: "Science" },
  { id: "business", label: "Business" },
  { id: "finance", label: "Finance" },
  { id: "stocks", label: "Stocks" },
  { id: "climate", label: "Climate" },
  { id: "health", label: "Health" },
  { id: "education", label: "Education" },
  { id: "sports", label: "Sports" },
  { id: "entertainment", label: "Entertainment" },
  { id: "culture", label: "Culture" }
];

export const COUNTRY_OPTIONS: Array<{ id: CountryCode; label: string }> = [
  { id: "global", label: "Global" },
  { id: "tn", label: "Tunisia" },
  { id: "us", label: "United States" },
  { id: "gb", label: "United Kingdom" },
  { id: "ca", label: "Canada" },
  { id: "au", label: "Australia" },
  { id: "in", label: "India" },
  { id: "de", label: "Germany" },
  { id: "fr", label: "France" },
  { id: "jp", label: "Japan" },
  { id: "cn", label: "China" },
  { id: "ru", label: "Russia" },
  { id: "br", label: "Brazil" },
  { id: "ae", label: "United Arab Emirates" },
  { id: "sg", label: "Singapore" }
];

export const CATEGORY_VALUES = [
  "world",
  "politics",
  "tech",
  "ai",
  "llm",
  "science",
  "business",
  "finance",
  "climate",
  "health",
  "education",
  "sports",
  "entertainment",
  "culture"
] as const;

export const COUNTRY_VALUES = [
  "global",
  "tn",
  "us",
  "gb",
  "ca",
  "au",
  "in",
  "de",
  "fr",
  "jp",
  "cn",
  "ru",
  "br",
  "ae",
  "sg"
] as const;

export const DATE_RANGE_VALUES = ["any", "24h", "7d", "30d"] as const;

export const DATE_RANGE_OPTIONS: Array<{ id: DateRange; label: string }> = [
  { id: "any", label: "Any time" },
  { id: "24h", label: "24 hours" },
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" }
];

export const NEWSAPI_CATEGORY_MAP: Record<Category, string> = {
  world: "general",
  politics: "general",
  tech: "technology",
  ai: "technology",
  llm: "technology",
  science: "science",
  business: "business",
  finance: "business",
  stocks: "business",
  climate: "science",
  health: "health",
  education: "general",
  sports: "sports",
  entertainment: "entertainment",
  culture: "entertainment"
};

export const GLOBAL_TOPIC_QUERY_MAP: Record<Exclude<Category, "world">, string> = {
  politics: "politics",
  tech: "technology",
  ai: "artificial intelligence",
  llm: "large language model OR llm",
  science: "science",
  business: "business",
  finance: "finance",
  stocks: "stock market OR equities",
  climate: "climate change",
  health: "health",
  education: "education",
  sports: "sports",
  entertainment: "entertainment",
  culture: "culture"
};

export const REGION_QUERY_MAP: Partial<Record<CountryCode, string>> = {
  tn: "Tunisia Tunisian تونس",
  cn: "China Chinese 中国 北京 上海",
  ru: "Russia Russian Россия Москва"
};

export const REGION_LANGUAGE_MAP: Partial<Record<CountryCode, string>> = {
  tn: "en",
  cn: "zh",
  ru: "ru"
};

function unique(values: Array<string | undefined>) {
  return Array.from(
    new Set(
      values
        .filter((value): value is string => Boolean(value && value.trim()))
        .map((value) => value.trim())
    )
  );
}

export function buildGlobalQuery(category: Category, query?: string): string | undefined {
  if (query?.trim()) {
    return query.trim();
  }

  if (category === "world") {
    return undefined;
  }

  return GLOBAL_TOPIC_QUERY_MAP[category];
}

export function buildRegionalQuery(country: CountryCode, category: Category, query?: string): string | undefined {
  const regionQuery = REGION_QUERY_MAP[country];
  const topicQuery = category === "world" ? undefined : GLOBAL_TOPIC_QUERY_MAP[category];

  return unique([regionQuery, query, topicQuery]).join(" ") || undefined;
}

export function getRegionLanguage(country: CountryCode): string {
  return REGION_LANGUAGE_MAP[country] ?? "en";
}

export function getDateRangeCutoff(dateRange: DateRange): Date | null {
  if (dateRange === "any") {
    return null;
  }

  const hours = dateRange === "24h" ? 24 : dateRange === "7d" ? 24 * 7 : 24 * 30;
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}
