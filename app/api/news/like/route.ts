import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getClientIp, registerArticleLike } from "@/lib/article-reactions";

export const dynamic = "force-dynamic";

const requestSchema = z.object({
  articleId: z.string().trim().min(1)
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

  const viewerIp = getClientIp(request.headers);

  try {
    const result = await registerArticleLike(parsed.data.articleId, viewerIp);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown reaction error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}