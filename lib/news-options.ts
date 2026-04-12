import type { Category, CountryCode, DateRange } from "@/types/news";

export const TOPIC_OPTIONS: Array<{ id: Category; label: string }> = [
  { id: "world", label: "World" },
  { id: "politics", label: "Politics" },
  { id: "tech", label: "Technology" },
  { id: "science", label: "Science" },
  { id: "business", label: "Business" },
  { id: "finance", label: "Finance" },
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
  { id: "br", label: "Brazil" },
  { id: "ae", label: "United Arab Emirates" },
  { id: "sg", label: "Singapore" }
];

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
  science: "science",
  business: "business",
  finance: "business",
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
  science: "science",
  business: "business",
  finance: "finance",
  climate: "climate change",
  health: "health",
  education: "education",
  sports: "sports",
  entertainment: "entertainment",
  culture: "culture"
};

export function buildGlobalQuery(category: Category, query?: string): string | undefined {
  if (query?.trim()) {
    return query.trim();
  }

  if (category === "world") {
    return undefined;
  }

  return GLOBAL_TOPIC_QUERY_MAP[category];
}

export function getDateRangeCutoff(dateRange: DateRange): Date | null {
  if (dateRange === "any") {
    return null;
  }

  const hours = dateRange === "24h" ? 24 : dateRange === "7d" ? 24 * 7 : 24 * 30;
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}
