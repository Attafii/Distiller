import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { fetchFullArticleText } from "@/lib/article-text";

export const dynamic = "force-dynamic";

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
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown full-text error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}