import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { alerts } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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
    const deleted = await db.delete(alerts)
      .where(and(
        eq(alerts.userId, session.user.id),
        eq(alerts.id, alertIdNum)
      ))
      .returning({ id: alerts.id });

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting alert:", error);
    return NextResponse.json({ error: "Failed to delete alert" }, { status: 500 });
  }
}