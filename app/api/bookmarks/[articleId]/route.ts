import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookmarks } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ articleId: string }> }
) {
  const session = await auth.api.getSession({ request, headers: request.headers });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { articleId } = await context.params;

  if (!articleId) {
    return NextResponse.json({ error: "Missing articleId" }, { status: 400 });
  }

  try {
    const deleted = await db.delete(bookmarks)
      .where(and(
        eq(bookmarks.userId, session.user.id),
        eq(bookmarks.articleId, articleId)
      ))
      .returning({ id: bookmarks.id });

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Bookmark not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting bookmark:", error);
    return NextResponse.json({ error: "Failed to delete bookmark" }, { status: 500 });
  }
}