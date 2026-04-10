import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { DistillService } from "@/lib/ai";
import type { ArticleChatMessage, DistilledArticle } from "@/types/news";

export const dynamic = "force-dynamic";

const categoryValues = ["world", "tech", "science", "business", "health", "sports", "entertainment"] as const;

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1)
});

const articleSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  content: z.string().nullable(),
  url: z.string().url(),
  imageUrl: z.string().nullable(),
  publishedAt: z.string(),
  source: z.object({
    id: z.string().nullable(),
    name: z.string()
  }),
  category: z.enum(categoryValues),
  summary: z.object({
    bullets: z.tuple([z.string(), z.string(), z.string()]),
    insight: z.string(),
    conclusion: z.string(),
    model: z.string(),
    confidence: z.number(),
    retrievedContext: z.array(z.string())
  })
});

const requestSchema = z.object({
  article: articleSchema,
  question: z.string().trim().min(1).max(600),
  history: z.array(chatMessageSchema).max(12).optional()
});

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

  const { article, question, history } = parsed.data;

  try {
    const distillService = DistillService.fromEnv();
    const result = await distillService.answerQuestion({
      article: article as DistilledArticle,
      summary: article.summary,
      question,
      history: history as ArticleChatMessage[] | undefined
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown chat error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
