import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookmarks } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

const createBookmarkSchema = z.object({
  articleId: z.string().min(1),
  title: z.string().min(1),
  url: z.string().url(),
  imageUrl: z.string().url().optional(),
  description: z.string().optional(),
  source: z.string().optional(),
  category: z.string().optional(),
  publishedAt: z.string().datetime().optional()
});

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ request, headers: request.headers });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userBookmarks = await db.query.bookmarks.findMany({
      where: eq(bookmarks.userId, session.user.id),
      orderBy: (bookmarks, { desc }) => [desc(bookmarks.createdAt)]
    });

    return NextResponse.json({ bookmarks: userBookmarks });
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return NextResponse.json({ error: "Failed to fetch bookmarks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

  const parsed = createBookmarkSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { articleId, title, url, imageUrl, description, source, category, publishedAt } = parsed.data;

  try {
    const existingBookmark = await db.query.bookmarks.findFirst({
      where: and(
        eq(bookmarks.userId, session.user.id),
        eq(bookmarks.articleId, articleId)
      )
    });

    if (existingBookmark) {
      return NextResponse.json({ error: "Bookmark already exists" }, { status: 409 });
    }

    const [newBookmark] = await db.insert(bookmarks).values({
      userId: session.user.id,
      articleId,
      title,
      url,
      imageUrl,
      description,
      source,
      category,
      publishedAt: publishedAt ? new Date(publishedAt) : null
    }).returning();

    return NextResponse.json({ bookmark: newBookmark }, { status: 201 });
  } catch (error) {
    console.error("Error creating bookmark:", error);
    return NextResponse.json({ error: "Failed to create bookmark" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({ request, headers: request.headers });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get("articleId");

  if (!articleId) {
    return NextResponse.json({ error: "Missing articleId query parameter" }, { status: 400 });
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