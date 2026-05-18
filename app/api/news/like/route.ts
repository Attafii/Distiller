import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp, registerArticleLike } from "@/lib/article-reactions";

export const dynamic = "force-dynamic";

function rateLimitHeaders(result: { remaining: number; resetIn: number }) {
  return {
    "X-RateLimit-Limit": "30",
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetIn / 1000))
  };
}

const requestSchema = z.object({
  articleId: z.string().trim().min(1)
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

  const viewerIp = getClientIp(request.headers);

  try {
    const result = await registerArticleLike(parsed.data.articleId, viewerIp);

    return NextResponse.json(result, { headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown reaction error";
    return NextResponse.json({ error: message }, { status: 502, headers });
  }
}