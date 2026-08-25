import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock, Plus, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { readingHistory } from "@/lib/db/schema";
import { headers } from "next/headers";
import { eq, desc } from "drizzle-orm";

export const metadata: Metadata = {
  title: "History",
  description: "Your reading history"
};

export default async function HistoryPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/login");
  }

  const userId = session.user.id;
  const db = getDb();

  const history = await db.query.readingHistory.findMany({
    where: eq(readingHistory.userId, userId),
    orderBy: [desc(readingHistory.readAt)],
    limit: 100
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">History</h1>
          <p className="mt-2 text-sm text-muted-foreground">Articles you have read.</p>
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
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Clock className="h-12 w-12 text-muted-foreground/40" />
              <p className="mt-4 text-base font-medium">No reading history yet</p>
              <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                Articles you read will automatically appear here so you can revisit them.
              </p>
              <Button variant="outline" className="mt-6" asChild>
                <Link href="/RefinedFeed">Start reading</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((entry) => (
                <a
                  key={entry.id}
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-4 rounded-xl border border-border p-4 hover:bg-muted-2/30 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{entry.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {entry.category ? `${entry.category} · ` : ""}
                      {entry.readAt ? new Date(entry.readAt).toLocaleDateString() : ""}
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
