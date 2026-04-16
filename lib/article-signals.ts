import type { ArticlePriority } from "@/types/news";

type ArticleTextInput = {
  title?: string | null;
  description?: string | null;
  content?: string | null;
};

const BREAKING_KEYWORDS = [
  "breaking",
  "urgent",
  "developing",
  "alert",
  "emergency",
  "flood",
  "flooding",
  "attack",
  "explosion",
  "evacuation",
  "shutdown",
  "court ruling",
  "passed",
  "failed",
  "resigns",
  "resignation"
];

const IMPORTANT_KEYWORDS = [
  "policy",
  "election",
  "budget",
  "funding",
  "rates",
  "rate",
  "earnings",
  "investigation",
  "lawsuit",
  "deal",
  "trade",
  "climate",
  "health",
  "regulation",
  "report",
  "warning",
  "security",
  "chip",
  "ai",
  "privacy"
];

function buildSignalText(article: ArticleTextInput) {
  return [article.title, article.description, article.content]
    .filter((value): value is string => Boolean(value && value.trim()))
    .join(" ")
    .toLowerCase();
}

function countKeywordHits(text: string, keywords: string[]) {
  return keywords.reduce((count, keyword) => count + (text.includes(keyword) ? 1 : 0), 0);
}

export function classifyArticlePriority(article: ArticleTextInput): ArticlePriority {
  const signalText = buildSignalText(article);
  const breakingHits = countKeywordHits(signalText, BREAKING_KEYWORDS);
  const importantHits = countKeywordHits(signalText, IMPORTANT_KEYWORDS);

  if (breakingHits > 0 || /\bbreaking\b/.test(signalText)) {
    return "breaking";
  }

  if (importantHits >= 2) {
    return "important";
  }

  return "normal";
}

export function getPriorityLabel(priority: ArticlePriority) {
  switch (priority) {
    case "breaking":
      return "Breaking";
    case "important":
      return "Important";
    default:
      return "Standard";
  }
}