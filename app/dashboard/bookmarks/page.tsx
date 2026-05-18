import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BookMarked, Plus, Trash2, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { bookmarks } from "@/lib/db/schema";
import { headers } from "next/headers";
import { eq, desc, and } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Bookmarks",
  description: "Your saved articles"
};

export default async function BookmarksPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/login");
  }

  const userId = session.user.id;
  const db = getDb();

  const userBookmarks = await db.query.bookmarks.findMany({
    where: eq(bookmarks.userId, userId),
    orderBy: [desc(bookmarks.createdAt)]
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Bookmarks</h1>
          <p className="mt-2 text-sm text-muted-foreground">Articles you have saved for later.</p>
        </div>
        <Button asChild>
          <Link href="/RefinedFeed">
            <Plus className="h-4 w-4" />
            Browse feed
          </Link>
        </Button>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-6">
          {userBookmarks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BookMarked className="h-12 w-12 text-muted-foreground/40" />
              <p className="mt-4 text-base font-medium">No bookmarks yet</p>
              <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                Tap the bookmark icon on any article while browsing to save it here for later.
              </p>
              <Button variant="outline" className="mt-6" asChild>
                <Link href="/RefinedFeed">Start browsing</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {userBookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="flex items-start justify-between gap-4 rounded-xl border border-border p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <a
                      href={bm.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                    >
                      <span className="truncate">{bm.title}</span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    </a>
                    <p className="text-xs text-muted-foreground mt-1">
                      {bm.source ?? "Unknown source"}
                      {bm.category ? ` · ${bm.category}` : ""}
                      {bm.publishedAt ? ` · ${new Date(bm.publishedAt).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                  <DeleteBookmarkButton articleId={bm.articleId} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DeleteBookmarkButton({ articleId }: { articleId: string }) {
  return (
    <form
      action={async () => {
        "use server";
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) return;

        const db = getDb();
        await db.delete(bookmarks).where(
          and(eq(bookmarks.userId, session.user.id), eq(bookmarks.articleId, articleId))
        );
      }}
    >
      <Button variant="ghost" size="sm" type="submit" className="text-muted-foreground hover:text-destructive">
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Delete bookmark</span>
      </Button>
    </form>
  );
}
