import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookmarks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ request, headers: request.headers });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") ?? "json";

  if (format !== "json" && format !== "csv") {
    return NextResponse.json(
      { error: "Invalid format. Use 'json' or 'csv'." },
      { status: 400 }
    );
  }

  try {
    const userBookmarks = await db.query.bookmarks.findMany({
      where: eq(bookmarks.userId, session.user.id),
      orderBy: (bookmarks, { desc }) => [desc(bookmarks.createdAt)]
    });

    if (format === "csv") {
      const headers = ["articleId", "title", "url", "description", "source", "category", "publishedAt", "createdAt"];
      const csvRows = [
        headers.join(","),
        ...userBookmarks.map((bm) =>
          [
            `"${(bm.articleId ?? "").replace(/"/g, '""')}"`,
            `"${(bm.title ?? "").replace(/"/g, '""')}"`,
            `"${(bm.url ?? "").replace(/"/g, '""')}"`,
            `"${(bm.description ?? "").replace(/"/g, '""')}"`,
            `"${(bm.source ?? "").replace(/"/g, '""')}"`,
            `"${(bm.category ?? "").replace(/"/g, '""')}"`,
            `"${bm.publishedAt ? bm.publishedAt.toISOString() : ""}"`,
            `"${bm.createdAt ? bm.createdAt.toISOString() : ""}"`
          ].join(",")
        )
      ];

      const csvContent = csvRows.join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="bookmarks-${Date.now()}.csv"`
        }
      });
    }

    return NextResponse.json({ bookmarks: userBookmarks });
  } catch (error) {
    console.error("Error exporting bookmarks:", error);
    return NextResponse.json({ error: "Failed to export bookmarks" }, { status: 500 });
  }
}