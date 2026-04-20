import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { DistillService } from "@/lib/ai";
import { fetchFullArticleText } from "@/lib/article-text";
import { analyzeNewsQuestion, rankNewsArticles } from "@/lib/news-assistant";
import { buildRagContext } from "@/lib/rag";
import { fetchNewsArticles } from "@/services/newsapi";
import type { ArticleChatMessage, Category, CountryCode, DateRange, NewsAssistantArticleContext, NewsAssistantResponse } from "@/types/news";

export const dynamic = "force-dynamic";

const categoryValues = [
  "world",
  "politics",
  "tech",
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

const countryValues = ["global", "tn", "us", "gb", "ca", "au", "in", "de", "fr", "jp", "br", "ae", "sg"] as const;

const dateRangeValues = ["any", "24h", "7d", "30d"] as const;

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1)
});

const requestSchema = z.object({
  question: z.string().trim().min(1).max(800),
  history: z.array(chatMessageSchema).max(12).optional(),
  category: z.enum(categoryValues).optional(),
  country: z.enum(countryValues).optional(),
  dateRange: z.enum(dateRangeValues).optional()
});

async function enrichArticle(article: ReturnType<typeof rankNewsArticles>[number], question: string): Promise<NewsAssistantArticleContext> {
  let resolvedArticle = article;

  try {
    const articleText = await fetchFullArticleText({
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url
    });

    resolvedArticle = {
      ...article,
      content: articleText.fullText
    };
  } catch (error) {
    console.warn("Unable to fetch full article text for assistant", {
      articleUrl: article.url,
      error: error instanceof Error ? error.message : String(error)
    });
  }

  const ragContext = await buildRagContext(resolvedArticle, question, 3);

  return {
    article: resolvedArticle,
    relevance: article.relevance,
    snippets: ragContext.snippets,
    context: ragContext.context
  };
}

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid request body",
        details: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  const { question, history, category, country, dateRange } = parsed.data;
  const analysis = analyzeNewsQuestion(question);
  const resolvedCategory = category ?? analysis.category ?? "world";
  const resolvedCountry = country ?? "global";
  const resolvedDateRange = dateRange ?? "any";

  try {
    const primaryResult = await fetchNewsArticles({
      category: resolvedCategory as Category,
      country: resolvedCountry as CountryCode,
      dateRange: resolvedDateRange as DateRange,
      page: 1,
      pageSize: 8,
      query: analysis.searchQuery
    });

    const fallbackResult = primaryResult.articles.length > 0 || analysis.searchQuery === question.trim()
      ? primaryResult
      : await fetchNewsArticles({
          category: resolvedCategory as Category,
          country: resolvedCountry as CountryCode,
          dateRange: resolvedDateRange as DateRange,
          page: 1,
          pageSize: 8,
          query: question.trim()
        });

    const rankedArticles = rankNewsArticles(fallbackResult.articles, analysis).slice(0, 3);
    const topScore = rankedArticles[0]?.relevance ?? 0;
    const normalizedArticles = rankedArticles.map((article) => ({
      ...article,
      relevance: topScore > 0 ? Math.max(1, Math.round((article.relevance / topScore) * 100)) : 0
    }));

    const enrichedArticles = await Promise.all(normalizedArticles.map((article) => enrichArticle(article, question)))
    const distillService = DistillService.fromEnv();
    const result = await distillService.answerNewsQuestion({
      question,
      analysis,
      history: history as ArticleChatMessage[] | undefined,
      articles: enrichedArticles
    });

    const response: NewsAssistantResponse = {
      answer: result.answer,
      model: result.model,
      retrievedContext: result.retrievedContext,
      searchQuery: analysis.searchQuery,
      articles: normalizedArticles.map((article, index) => ({
        id: article.id,
        title: article.title,
        url: article.url,
        source: article.source.name,
        publishedAt: article.publishedAt,
        relevance: article.relevance,
        snippet: enrichedArticles[index]?.snippets[0] ?? article.description ?? article.content ?? ""
      }))
    };

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown assistant error";
    console.error("News assistant request failed", {
      question,
      category: resolvedCategory,
      country: resolvedCountry,
      dateRange: resolvedDateRange,
      error: message
    });

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
