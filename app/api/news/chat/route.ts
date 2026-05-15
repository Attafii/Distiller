import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { DistillService } from "@/lib/ai";
import { CATEGORY_VALUES } from "@/lib/news-options";
import { checkRateLimit } from "@/lib/rate-limit";
import type { ArticleChatMessage, DistilledArticle } from "@/types/news";

export const dynamic = "force-dynamic";

function rateLimitHeaders(result: { remaining: number; resetIn: number }) {
  return {
    "X-RateLimit-Limit": "30",
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetIn / 1000))
  };
}

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1)
});

const articleSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(500),
  description: z.string().nullable(),
  content: z.string().nullable(),
  url: z.string().url(),
  imageUrl: z.string().url().nullable(),
  publishedAt: z.string().datetime(),
  source: z.object({
    id: z.string().nullable(),
    name: z.string().min(1).max(200)
  }),
  category: z.enum(CATEGORY_VALUES),
  summary: z.object({
    bullets: z.tuple([z.string().min(1), z.string().min(1), z.string().min(1)]),
    insight: z.string().min(1),
    conclusion: z.string().min(1),
    model: z.string(),
    confidence: z.number().min(0).max(1),
    retrievedContext: z.array(z.string())
  })
}).strict();

const requestSchema = z.object({
  article: articleSchema,
  question: z.string().trim().min(1).max(600),
  history: z.array(chatMessageSchema).max(12).optional()
}).strict();

export async function POST(request: NextRequest) {
  const contentLength = request.headers.get("content-length");
  const MAX_BODY_SIZE = 100 * 1024;

  if (contentLength && Number(contentLength) > MAX_BODY_SIZE) {
    return NextResponse.json(
      { error: "Request body too large" },
      { status: 413 }
    );
  }

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
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers });
  }

  const parsed = requestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid request body",
        details: parsed.error.flatten()
      },
      { status: 400, headers }
    );
  }

  const { article, question, history } = parsed.data;

  try {
    const distillService = DistillService.fromEnv();
    const result = await distillService.answerQuestion({
      article: article as DistilledArticle,
      summary: article.summary,
      question,
      history: history as ArticleChatMessage[] | undefined
    });

    return NextResponse.json(result, { headers });
  } catch {
    return NextResponse.json({ error: "An error occurred processing your request" }, { status: 502, headers });
  }
}