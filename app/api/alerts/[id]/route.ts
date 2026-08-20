import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { alerts } from "@/lib/db/schema";
import { checkRateLimit } from "@/lib/rate-limit";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateAlertSchema = z.object({
  keyword: z.string().trim().min(1).max(100).optional(),
  frequency: z.enum(["daily", "weekly"]).optional(),
  active: z.boolean().optional()
});

function rateLimitHeaders(result: { remaining: number; resetIn: number }) {
  return {
    "X-RateLimit-Limit": "30",
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetIn / 1000))
  };
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "Missing alert id" }, { status: 400 });
  }

  const alertIdNum = Number(id);

  if (isNaN(alertIdNum)) {
    return NextResponse.json({ error: "Invalid alert id" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const data = updateAlertSchema.parse(body);

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const updated = await getDb().update(alerts)
      .set({ ...data, updatedAt: new Date() })
      .where(and(
        eq(alerts.userId, session.user.id),
        eq(alerts.id, alertIdNum)
      ))
      .returning({ id: alerts.id, keyword: alerts.keyword, frequency: alerts.frequency, active: alerts.active });

    if (updated.length === 0) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, alert: updated[0] }, { headers });
  } catch (error) {
    console.error("Error updating alert:", error);
    return NextResponse.json({ error: "Failed to update alert" }, { status: 500, headers });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "Missing alert id" }, { status: 400 });
  }

  const alertIdNum = Number(id);

  if (isNaN(alertIdNum)) {
    return NextResponse.json({ error: "Invalid alert id" }, { status: 400 });
  }

  try {
    const deleted = await getDb().delete(alerts)
      .where(and(
        eq(alerts.userId, session.user.id),
        eq(alerts.id, alertIdNum)
      ))
      .returning({ id: alerts.id });

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { headers });
  } catch (error) {
    console.error("Error deleting alert:", error);
    return NextResponse.json({ error: "Failed to delete alert" }, { status: 500, headers });
  }
}