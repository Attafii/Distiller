import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { checkRateLimit } from "@/lib/rate-limit";
import { fetchFullArticleText } from "@/lib/article-text";

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

  try {
    const result = await fetchFullArticleText(parsed.data.article);
    return NextResponse.json(result, { headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown full-text error";
    return NextResponse.json({ error: message }, { status: 502, headers });
  }
}