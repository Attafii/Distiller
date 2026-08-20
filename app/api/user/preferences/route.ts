import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { userPreferences } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const preferencesSchema = z.object({
  topics: z.array(z.string()).optional(),
  regions: z.array(z.string()).optional(),
  deliveryPreference: z.string().optional(),
  onboardingCompleted: z.boolean().optional(),
  dailyEmailEnabled: z.boolean().optional(),
  breakingNewsEnabled: z.boolean().optional(),
  weeklySummaryEnabled: z.boolean().optional()
});

// ponytail: POST and PATCH do the same thing — upsert preferences
async function upsertPreferences(request: NextRequest) {
  const rateLimit = await checkRateLimit(request);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = preferencesSchema.parse(body);

    const existing = await getDb().query.userPreferences.findFirst({
      where: eq(userPreferences.userId, session.user.id)
    });

    if (existing) {
      await getDb()
        .update(userPreferences)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(userPreferences.userId, session.user.id));
    } else {
      await getDb().insert(userPreferences).values({
        userId: session.user.id,
        ...data
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return upsertPreferences(request);
}

export async function PATCH(request: NextRequest) {
  return upsertPreferences(request);
}

export async function GET(request: NextRequest) {
  const rateLimit = await checkRateLimit(request);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prefs = await getDb().query.userPreferences.findFirst({
    where: eq(userPreferences.userId, session.user.id)
  });

  return NextResponse.json(prefs ?? null);
}
