import type { Metadata } from "next";
import Link from "next/link";
import { BookMarked, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Bookmarks",
  description: "Your saved articles"
};

export default function BookmarksPage() {
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
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <BookMarked className="h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 text-base font-medium">No bookmarks yet</p>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs">
            Tap the bookmark icon on any article while browsing to save it here for later.
          </p>
          <Button variant="outline" className="mt-6" asChild>
            <Link href="/RefinedFeed">Start browsing</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}