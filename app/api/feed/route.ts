import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { DistillService } from "@/lib/ai";
import { annotateArticleReactions, getClientIp } from "@/lib/article-reactions";
import { fetchNewsArticles } from "@/services/newsapi";
import type { DistilledArticle, DistilledSummary, NewsArticle } from "@/types/news";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  category: z.enum(["world", "politics", "tech", "science", "business", "finance", "climate", "health", "education", "sports", "entertainment", "culture"]).default("tech"),
  country: z.enum(["global", "tn", "us", "gb", "ca", "au", "in", "de", "fr", "jp", "br", "ae", "sg"]).default("global"),
  dateRange: z.enum(["any", "24h", "7d", "30d"]).default("any"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(12).default(6),
  mode: z.enum(["auto", "fast", "balanced", "deep"]).default("auto"),
  query: z.string().trim().min(1).optional()
});

function fallbackSummary(article: NewsArticle): DistilledSummary {
  return {
    bullets: [
      article.title,
      article.description ?? article.content ?? "The article did not provide a description, so it needs manual review.",
      `Source: ${article.source.name}`
    ],
    insight: article.description ?? article.content ?? article.title,
    conclusion: `Follow up with the original story from ${article.source.name} for the latest details.`,
    model: "fallback",
    confidence: 0.18,
    retrievedContext: []
  };
}

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));
  const viewerIp = getClientIp(request.headers);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid query params",
        details: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  const { category, country, dateRange, page, pageSize, mode, query } = parsed.data;

  try {
    const { articles, totalResults } = await fetchNewsArticles({ category, country, dateRange, page, pageSize, query });
    const distillService = DistillService.fromEnv();
    const batchSize = Math.max(1, Number(process.env.DISTILL_BATCH_SIZE ?? "3"));
    const distilled: Array<NewsArticle & { summary: DistilledSummary }> = [];

    for (let index = 0; index < articles.length; index += batchSize) {
      const batch = articles.slice(index, index + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (article) => {
          try {
            const summary = await distillService.summarizeArticle({
              article,
              mode,
              query: query ?? article.title
            });

            return { ...article, summary };
          } catch {
            return { ...article, summary: fallbackSummary(article) };
          }
        })
      );

      distilled.push(...batchResults);
    }

    const articlesWithReactions = await annotateArticleReactions(distilled, viewerIp);

    return NextResponse.json({
      articles: articlesWithReactions,
      totalResults,
      page,
      pageSize,
      hasMore: page * pageSize < totalResults
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown feed error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
