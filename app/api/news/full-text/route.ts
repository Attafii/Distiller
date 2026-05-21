import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { fetchFullArticleText } from "@/lib/article-text";
import { FREE_MONTHLY_ARTICLE_LIMIT, reserveMonthlyArticleUsage, getUserSubscription } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

function rateLimitHeaders(result: { remaining: number; resetIn: number }) {
  return {
    "X-RateLimit-Limit": "30",
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetIn / 1000))
  };
}

const articleSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().nullable(),
  content: z.string().nullable(),
  url: z.string().url()
});

const requestSchema = z.object({
  article: articleSchema
});

export async function POST(request: NextRequest) {
  const rateLimit = await checkRateLimit(request);
  const headers = rateLimitHeaders(rateLimit);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait before making more requests." },
      { status: 429, headers }
    );
  }

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

  const session = await auth.api.getSession({ request, headers: request.headers });

  if (session?.user) {
    const subscription = await getUserSubscription(session.user.id);
    const plan = subscription?.plan ?? "free";

    if (plan === "free") {
      const yearMonth = new Date().toISOString().slice(0, 7);
      const reservedUsage = await reserveMonthlyArticleUsage(session.user.id, yearMonth, FREE_MONTHLY_ARTICLE_LIMIT);

      if (!reservedUsage) {
        return NextResponse.json(
          {
            error: `You have reached your ${FREE_MONTHLY_ARTICLE_LIMIT} articles/month limit. Upgrade to continue reading.`,
            limit: FREE_MONTHLY_ARTICLE_LIMIT
          },
          { status: 403, headers }
        );
      }
    }
  }

  try {
    const result = await fetchFullArticleText(parsed.data.article);
    return NextResponse.json(result, { headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown full-text error";
    return NextResponse.json({ error: message }, { status: 502, headers });
  }
}