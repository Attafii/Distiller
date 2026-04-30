import "server-only";

import nlp from "compromise";

import { REGION_QUERY_MAP } from "@/lib/news-options";
import type { Category, CountryCode, NewsArticle } from "@/types/news";

export type NewsAssistantIntent = "latest" | "specific" | "explain" | "general";

export interface NewsQueryAnalysis {
  question: string;
  category: Category | null;
  country: CountryCode | null;
  intent: NewsAssistantIntent;
  phrases: string[];
  keywords: string[];
  searchQuery: string;
}

export interface RankedNewsArticle extends NewsArticle {
  relevance: number;
  matchedTerms: string[];
}

const STOP_WORDS = new Set([
  "a",
  "about",
  "after",
  "again",
  "all",
  "also",
  "an",
  "and",
  "any",
  "are",
  "around",
  "as",
  "ask",
  "at",
  "be",
  "because",
  "before",
  "best",
  "between",
  "but",
  "by",
  "can",
  "could",
  "details",
  "did",
  "do",
  "does",
  "for",
  "from",
  "give",
  "go",
  "has",
  "have",
  "how",
  "i",
  "if",
  "in",
  "into",
  "is",
  "it",
  "latest",
  "me",
  "more",
  "news",
  "not",
  "on",
  "or",
  "please",
  "show",
  "specific",
  "story",
  "stories",
  "tell",
  "than",
  "that",
  "the",
  "their",
  "there",
  "these",
  "this",
  "to",
  "update",
  "updates",
  "what",
  "when",
  "where",
  "which",
  "who",
  "why",
  "with",
  "would"
]);

const CATEGORY_HINTS: Record<Category, string[]> = {
  ai: ["ai", "artificial intelligence", "machine learning", "generative ai", "agentic", "inference", "copilot", "foundation model", "model release", "benchmark"],
  llm: ["llm", "large language model", "language model", "foundation model", "prompt", "token", "context window", "reasoning model", "chatbot", "generative ai"],
  world: ["world", "global", "international", "diplomacy", "summit", "border", "conflict", "war", "peace"],
  politics: ["politics", "election", "government", "policy", "parliament", "senate", "congress", "minister", "lawmakers"],
  tech: ["tech", "technology", "ai", "artificial intelligence", "software", "chip", "chips", "startup", "platform", "cyber", "semiconductor", "cloud"],
  ai: ["ai", "artificial intelligence", "machine learning", "generative ai", "model", "inference", "agent", "copilot", "foundation model", "benchmark"],
  llm: ["llm", "large language model", "foundation model", "transformer", "prompt", "context window", "token", "reasoning model", "chatbot"],
  science: ["science", "research", "study", "laboratory", "space", "biology", "physics", "astronomy", "medical"],
  business: ["business", "company", "revenue", "merger", "trade", "supply chain", "logistics", "startup", "industry"],
  finance: ["finance", "markets", "stocks", "inflation", "interest rates", "earnings", "bond", "bank", "fed", "central bank"],
  stocks: ["stocks", "stock market", "equities", "shares", "nasdaq", "dow", "s&p", "ticker", "portfolio", "valuation"],
  climate: ["climate", "warming", "flood", "wildfire", "weather", "emissions", "renewable", "energy", "environment"],
  health: ["health", "hospital", "medicine", "medical", "vaccine", "disease", "nutrition", "public health", "patient"],
  education: ["education", "school", "classroom", "university", "students", "teachers", "curriculum", "campus"],
  sports: ["sports", "game", "match", "league", "tournament", "playoff", "coach", "athlete", "football", "basketball"],
  entertainment: ["entertainment", "film", "movie", "music", "streaming", "celebrity", "festival", "show", "tv"],
  culture: ["culture", "art", "museum", "books", "literature", "design", "theater", "heritage", "festival"]
};

const COUNTRY_HINTS: Record<CountryCode, string[]> = {
  global: [],
  tn: ["tunisia", "tunisian", "tunis", "تونس"],
  us: ["united states", "u.s.", "america", "american", "washington", "new york"],
  gb: ["united kingdom", "uk", "britain", "british", "london"],
  ca: ["canada", "canadian", "ottawa", "toronto", "montreal"],
  au: ["australia", "australian", "sydney", "melbourne", "canberra"],
  in: ["india", "indian", "new delhi", "mumbai", "bengaluru"],
  de: ["germany", "german", "berlin", "munich"],
  fr: ["france", "french", "paris", "lyon"],
  jp: ["japan", "japanese", "tokyo", "osaka"],
  cn: ["china", "chinese", "beijing", "shanghai", "shenzhen", "中国", "北京", "上海"],
  ru: ["russia", "russian", "moscow", "st petersburg", "россия", "москва", "санкт-петербург"],
  br: ["brazil", "brazilian", "brasilia", "sao paulo", "rio de janeiro"],
  ae: ["united arab emirates", "uae", "dubai", "abu dhabi"],
  sg: ["singapore"]
};

const LATEST_HINTS = ["latest", "today", "recent", "new", "now", "currently", "this week", "this month"];
const EXPLAIN_HINTS = ["why", "how", "impact", "means", "explain", "what does", "what happened", "why did"];
const SPECIFIC_HINTS = ["specific", "exact", "who", "which", "where", "when", "what happened", "find", "look up"];
const WORD_PATTERN = /[\p{L}\p{N}]{2,}/gu;

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, " ").replace(/\s+/g, " ").trim();
}

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function tokenize(value: string) {
  return unique(normalizeText(value).match(WORD_PATTERN) ?? []).filter((term) => term.length > 2 && !STOP_WORDS.has(term));
}

function flattenCompromiseTerms(question: string) {
  const doc = nlp(question);

  return unique(
    [
      ...(doc.people().out("array") as string[]),
      ...(doc.places().out("array") as string[]),
      ...(doc.organizations().out("array") as string[]),
      ...(doc.nouns().out("array") as string[])
    ]
      .flatMap((phrase) => normalizeText(phrase).split(" "))
      .filter((term) => term.length > 1 && !STOP_WORDS.has(term))
  );
}

function extractPhrases(question: string) {
  const doc = nlp(question);

  return unique(
    [
      ...(doc.people().out("array") as string[]),
      ...(doc.places().out("array") as string[]),
      ...(doc.organizations().out("array") as string[]),
      ...(doc.nouns().out("array") as string[])
    ]
      .map((phrase) => normalizeText(phrase))
      .filter((phrase) => phrase.length > 1 && !STOP_WORDS.has(phrase))
  );
}

function detectCountry(question: string): CountryCode | null {
  const normalized = normalizeText(question);

  for (const [country, hints] of Object.entries(COUNTRY_HINTS) as Array<[CountryCode, string[]]>) {
    if (country === "global") {
      continue;
    }

    if (hints.some((hint) => normalized.includes(normalizeText(hint)))) {
      return country;
    }
  }

  return null;
}

function detectIntent(question: string): NewsAssistantIntent {
  const normalized = normalizeText(question);

  if (LATEST_HINTS.some((hint) => normalized.includes(hint))) {
    return "latest";
  }

  if (EXPLAIN_HINTS.some((hint) => normalized.includes(hint))) {
    return "explain";
  }

  if (SPECIFIC_HINTS.some((hint) => normalized.includes(hint))) {
    return "specific";
  }

  return "general";
}

function detectCategory(question: string, phrases: string[], keywords: string[]): Category | null {
  const normalized = normalizeText([question, ...phrases, ...keywords].join(" "));
  let winner: Category | null = null;
  let highestScore = 0;

  (Object.entries(CATEGORY_HINTS) as Array<[Category, string[]]>).forEach(([category, hints]) => {
    const score = hints.reduce((total, hint) => total + (normalized.includes(normalizeText(hint)) ? 1 : 0), 0);

    if (score > highestScore) {
      highestScore = score;
      winner = category;
    }
  });

  return highestScore > 0 ? winner : null;
}

function buildSearchQuery(phrases: string[], keywords: string[], question: string, country: CountryCode | null) {
  const regionParts = country ? (REGION_QUERY_MAP[country] ?? "").split(/\s+/).filter(Boolean) : [];
  const queryParts = unique([...regionParts, ...phrases.slice(0, 3), ...keywords.slice(0, 6)]);
  return queryParts.length > 0 ? queryParts.join(" ") : question.trim();
}

function recencyBoost(publishedAt: string) {
  const publishedTimestamp = new Date(publishedAt).getTime();
  if (!Number.isFinite(publishedTimestamp)) {
    return 0;
  }

  const ageHours = Math.max(0, (Date.now() - publishedTimestamp) / (1000 * 60 * 60));

  if (ageHours <= 12) {
    return 3;
  }

  if (ageHours <= 24) {
    return 2.5;
  }

  if (ageHours <= 72) {
    return 1.5;
  }

  if (ageHours <= 168) {
    return 0.75;
  }

  return 0.25;
}

function countMatches(text: string, terms: string[], weight: number) {
  const haystack = normalizeText(text);
  let score = 0;

  for (const term of terms) {
    if (!term) {
      continue;
    }

    const normalizedTerm = normalizeText(term);
    if (!normalizedTerm) {
      continue;
    }

    if (haystack.includes(normalizedTerm)) {
      score += normalizedTerm.includes(" ") ? weight * 1.5 : weight;
    }
  }

  return score;
}

export function analyzeNewsQuestion(question: string): NewsQueryAnalysis {
  const trimmedQuestion = question.trim();
  const phrases = extractPhrases(trimmedQuestion);
  const keywords = unique([...flattenCompromiseTerms(trimmedQuestion), ...tokenize(trimmedQuestion)]);
  const category = detectCategory(trimmedQuestion, phrases, keywords);
  const country = detectCountry(trimmedQuestion);
  const intent = detectIntent(trimmedQuestion);

  return {
    question: trimmedQuestion,
    category,
    country,
    intent,
    phrases,
    keywords,
    searchQuery: buildSearchQuery(phrases, keywords, trimmedQuestion, country)
  };
}

export function rankNewsArticles(articles: NewsArticle[], analysis: NewsQueryAnalysis): RankedNewsArticle[] {
  return articles
    .map((article) => {
      const searchTerms = [...analysis.phrases, ...analysis.keywords];
      const titleScore = countMatches(article.title, searchTerms, 4);
      const descriptionScore = countMatches(article.description ?? "", searchTerms, 2.5);
      const contentScore = countMatches(article.content ?? "", searchTerms, 1.25);
      const sourceScore = countMatches(article.source.name, analysis.keywords, 1);
      const categoryScore = analysis.category && article.category === analysis.category ? 2.5 : 0;
      const latestScore = analysis.intent === "latest" ? recencyBoost(article.publishedAt) : 0;

      const matchedTerms = unique(
        searchTerms.filter((term) => {
          const haystack = normalizeText([article.title, article.description ?? "", article.content ?? "", article.source.name].join(" "));
          return haystack.includes(normalizeText(term));
        })
      );

      return {
        ...article,
        relevance: titleScore + descriptionScore + contentScore + sourceScore + categoryScore + latestScore,
        matchedTerms
      };
    })
    .sort((left, right) => right.relevance - left.relevance);
}
