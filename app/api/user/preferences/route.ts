import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { userPreferences } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const preferencesSchema = z.object({
  topics: z.array(z.string()),
  regions: z.array(z.string()),
  deliveryPreference: z.string().default("web"),
  onboardingCompleted: z.boolean().default(false)
});

export async function POST(request: NextRequest) {
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
        .set({
          topics: data.topics,
          regions: data.regions,
          deliveryPreference: data.deliveryPreference,
          onboardingCompleted: data.onboardingCompleted,
          updatedAt: new Date()
        })
        .where(eq(userPreferences.userId, session.user.id));
    } else {
      await getDb().insert(userPreferences).values({
        userId: session.user.id,
        topics: data.topics,
        regions: data.regions,
        deliveryPreference: data.deliveryPreference,
        onboardingCompleted: data.onboardingCompleted
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prefs = await getDb().query.userPreferences.findFirst({
    where: eq(userPreferences.userId, session.user.id)
  });

  return NextResponse.json(prefs ?? null);
}