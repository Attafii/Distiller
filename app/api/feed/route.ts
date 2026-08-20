import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { DistillService } from "@/lib/ai";
import { annotateArticleReactions, getClientIp } from "@/lib/article-reactions";
import { CATEGORY_VALUES, COUNTRY_VALUES, DATE_RANGE_VALUES } from "@/lib/news-options";
import { checkGuestFeedAccess, GUEST_ALLOWED_TOPICS, incrementGuestCount } from "@/lib/plans";
import { fetchWithFallback } from "@/services/news-providers";
import { checkRateLimit } from "@/lib/rate-limit";
import type { DistilledSummary, NewsArticle } from "@/types/news";
import { auth } from "@/lib/auth";
import { getUserSubscription, reserveMonthlyArticleUsage } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

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
    const access = await checkGuestFeedAccess(viewerIp);
    if (!access.ok) {
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
    category = GUEST_ALLOWED_TOPICS.includes(category as "world" | "tech") ? category : "world";
    pageSize = Math.min(pageSize, access.remaining);
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

  // Check free-plan monthly article limits for authenticated users (don't reserve yet)
  let freePlanUser = false;
  if (!isGuest && session?.user) {
    const sub = await getUserSubscription(session.user.id);
    const plan = sub?.plan ?? "free";
    freePlanUser = plan === "free";
  }

  try {
    const { articles, provider } = await fetchWithFallback({ category, country, dateRange, page, pageSize, query });

    // Reserve quota AFTER successful fetch for free-plan users
    if (freePlanUser && session?.user) {
      const yearMonth = new Date().toISOString().slice(0, 7);
      const usage = await reserveMonthlyArticleUsage(session.user.id, yearMonth);
      if (!usage) {
        return NextResponse.json({
          error: "Monthly article limit reached. Upgrade to Pro for unlimited articles.",
          limitReached: true
        }, { status: 429, headers });
      }
    }
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
      articlesWithReactions = distilled.map((article) => ({
        ...article,
        likeCount: 0,
        likedByViewer: false
      }));
    }

    if (isGuest) {
      await incrementGuestCount(viewerIp);
    }

    const totalResults = articlesWithReactions.length;
    const hasMore = totalResults === pageSize; // If we got a full page, there might be more

    return NextResponse.json({
      articles: articlesWithReactions,
      totalResults,
      page,
      pageSize,
      hasMore,
      provider
    }, { headers });
  } catch (error) {
    console.error("[Feed] Error:", error);
    return NextResponse.json(
      { error: "Failed to load feed. Please try again." },
      { status: 502, headers }
    );
  }
}
