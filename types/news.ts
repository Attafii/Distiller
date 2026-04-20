export type ArticlePriority = "normal" | "important" | "breaking";

export type Category =
  | "world"
  | "politics"
  | "tech"
  | "science"
  | "business"
  | "finance"
  | "climate"
  | "health"
  | "education"
  | "sports"
  | "entertainment"
  | "culture";
export type CountryCode = "global" | "tn" | "us" | "gb" | "ca" | "au" | "in" | "de" | "fr" | "jp" | "br" | "ae" | "sg";
export type DateRange = "any" | "24h" | "7d" | "30d";
export type SummarizationMode = "auto" | "fast" | "balanced" | "deep";

export interface NewsSource {
  id: string | null;
  name: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  imageUrl: string | null;
  publishedAt: string;
  source: NewsSource;
  category: Category;
  priority: ArticlePriority;
}

export interface DistilledSummary {
  bullets: [string, string, string];
  insight: string;
  conclusion: string;
  model: string;
  confidence: number;
  retrievedContext: string[];
}

export interface DistilledArticle extends NewsArticle {
  summary: DistilledSummary;
  likeCount: number;
  likedByViewer: boolean;
}

export interface ArticleLikeResponse {
  articleId: string;
  likeCount: number;
  likedByViewer: boolean;
}

export interface ArticleFullTextResponse {
  fullText: string;
  source: "remote" | "feed";
  hadTruncation: boolean;
}

export interface FeedResponse {
  articles: DistilledArticle[];
  totalResults: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface FeedRequest {
  category: Category;
  country?: CountryCode;
  dateRange?: DateRange;
  page?: number;
  pageSize?: number;
  mode?: SummarizationMode;
  query?: string;
}

export interface ArticleChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ArticleChatRequest {
  article: DistilledArticle;
  question: string;
  history?: ArticleChatMessage[];
}

export interface ArticleChatResponse {
  answer: string;
  model: string;
  retrievedContext: string[];
}

export interface NewsAssistantArticleReference {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  relevance: number;
  snippet: string;
}

export interface NewsAssistantArticleContext {
  article: NewsArticle;
  relevance: number;
  snippets: string[];
  context: string;
}

export interface NewsAssistantResponse {
  answer: string;
  model: string;
  retrievedContext: string[];
  searchQuery: string;
  articles: NewsAssistantArticleReference[];
}

export interface GitHubRepoStats {
  repoSlug: string;
  repoUrl: string;
  starUrl: string;
  stars: number;
  forks: number;
  openIssues: number;
  fetchedAt: string;
}
