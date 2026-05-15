import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { readingHistory } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

const createHistorySchema = z.object({
  articleId: z.string().min(1),
  title: z.string().min(1),
  url: z.string().url(),
  category: z.string().optional()
});

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ request, headers: request.headers });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const history = await db.query.readingHistory.findMany({
      where: eq(readingHistory.userId, session.user.id),
      orderBy: [desc(readingHistory.readAt)],
      limit: 100
    });

    return NextResponse.json({ history });
  } catch (error) {
    console.error("Error fetching reading history:", error);
    return NextResponse.json({ error: "Failed to fetch reading history" }, { status: 500 });
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

  const parsed = createHistorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { articleId, title, url, category } = parsed.data;

  try {
    const [newEntry] = await db.insert(readingHistory).values({
      userId: session.user.id,
      articleId,
      title,
      url,
      category
    }).returning();

    return NextResponse.json({ entry: newEntry }, { status: 201 });
  } catch (error) {
    console.error("Error creating history entry:", error);
    return NextResponse.json({ error: "Failed to create history entry" }, { status: 500 });
  }
}