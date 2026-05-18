import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { alerts } from "@/lib/db/schema";
import { checkRateLimit } from "@/lib/rate-limit";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

function rateLimitHeaders(result: { remaining: number; resetIn: number }) {
  return {
    "X-RateLimit-Limit": "30",
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetIn / 1000))
  };
}

const createAlertSchema = z.object({
  keyword: z.string().min(1).max(200),
  frequency: z.enum(["daily", "weekly"]).optional().default("daily"),
  active: z.boolean().optional().default(true)
});

export async function GET(request: NextRequest) {
  const rateLimit = await checkRateLimit(request);
  const headers = rateLimitHeaders(rateLimit);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait before making more requests." },
      { status: 429, headers }
    );
  }

  const session = await auth.api.getSession({ request, headers: request.headers });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userAlerts = await getDb().query.alerts.findMany({
      where: eq(alerts.userId, session.user.id),
      orderBy: [desc(alerts.createdAt)]
    });

    return NextResponse.json({ alerts: userAlerts }, { headers });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500, headers });
  }
}

export async function POST(request: NextRequest) {
  const rateLimit = await checkRateLimit(request);
  const headers = rateLimitHeaders(rateLimit);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait before making more requests." },
      { status: 429, headers }
    );
  }

  const session = await auth.api.getSession({ request, headers: request.headers });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createAlertSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { keyword, frequency, active } = parsed.data;

  try {
    const [newAlert] = await getDb().insert(alerts).values({
      userId: session.user.id,
      keyword,
      frequency,
      active
    }).returning();

    return NextResponse.json({ alert: newAlert }, { status: 201, headers });
  } catch (error) {
    console.error("Error creating alert:", error);
    return NextResponse.json({ error: "Failed to create alert" }, { status: 500, headers });
  }
}