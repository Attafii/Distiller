import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { DistillService } from "@/lib/ai";
import { annotateArticleReactions, getClientIp } from "@/lib/article-reactions";
import { CATEGORY_VALUES, COUNTRY_VALUES, DATE_RANGE_VALUES } from "@/lib/news-options";
import { fetchNewsArticles } from "@/services/newsapi";
import { checkRateLimit } from "@/lib/rate-limit";
import type { DistilledArticle, DistilledSummary, NewsArticle } from "@/types/news";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const GUEST_DAILY_LIMIT = 50;
const GUEST_ALLOWED_CATEGORIES: Array<"world" | "tech"> = ["world", "tech"];

const guestViewCounts = new Map<string, { count: number; dateStr: string }>();

function getGuestCount(ip: string): number {
  const today = new Date().toISOString().split("T")[0];
  const entry = guestViewCounts.get(ip);
  if (!entry || entry.dateStr !== today) {
    guestViewCounts.set(ip, { count: 0, dateStr: today });
    return 0;
  }
  return entry.count;
}

function incrementGuestCount(ip: string): number {
  const today = new Date().toISOString().split("T")[0];
  const entry = guestViewCounts.get(ip);
  if (!entry || entry.dateStr !== today) {
    guestViewCounts.set(ip, { count: 1, dateStr: today });
    return 1;
  }
  entry.count += 1;
  return entry.count;
}

function rateLimitHeaders(result: { remaining: number; resetIn: number }) {
  return {
    "X-RateLimit-Limit": "30",
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetIn / 1000))
  };
}

const querySchema = z.object({
  category: z.enum(CATEGORY_VALUES).default("tech"),
  country: z.enum(COUNTRY_VALUES).default("global"),
  dateRange: z.enum(DATE_RANGE_VALUES).default("any"),
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
  const rateLimit = await checkRateLimit(request);
  const headers = rateLimitHeaders(rateLimit);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait before making more requests." },
      { status: 429, headers }
    );
  }

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

  const { dateRange, page, mode, query } = parsed.data;
  let { category, country, pageSize } = parsed.data;

  const session = await auth.api.getSession({ request, headers: request.headers });
  const isGuest = !session?.user;

  if (isGuest) {
    const currentCount = getGuestCount(viewerIp);
    if (currentCount >= GUEST_DAILY_LIMIT) {
      return NextResponse.json({
        articles: [],
        totalResults: 0,
        page,
        pageSize,
        hasMore: false,
        guestLimitReached: true
      }, { headers });
    }

    country = "global";
    category = GUEST_ALLOWED_CATEGORIES.includes(category as "world" | "tech") ? category : "world";
    pageSize = Math.min(pageSize, GUEST_DAILY_LIMIT - currentCount);
    if (pageSize <= 0) {
      return NextResponse.json({
        articles: [],
        totalResults: 0,
        page,
        pageSize,
        hasMore: false,
        guestLimitReached: true
      }, { headers });
    }
  }

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

    let articlesWithReactions = distilled;

    try {
      articlesWithReactions = await annotateArticleReactions(distilled, viewerIp);
    } catch (reactionError) {
      console.warn("Failed to load article reactions, proceeding without:", reactionError instanceof Error ? reactionError.message : String(reactionError));
    }

    if (isGuest) {
      incrementGuestCount(viewerIp);
    }

    const guestLimitReached = isGuest && getGuestCount(viewerIp) >= GUEST_DAILY_LIMIT;

    return NextResponse.json({
      articles: articlesWithReactions,
      totalResults,
      page,
      pageSize,
      hasMore: articlesWithReactions.length === pageSize && page * pageSize < totalResults,
      ...(guestLimitReached ? { guestLimitReached: true } : {})
    }, { headers });
  } catch {
    return NextResponse.json({ error: "An error occurred while fetching the feed" }, { status: 502 });
  }
}
