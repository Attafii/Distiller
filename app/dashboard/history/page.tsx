import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "History",
  description: "Your reading history"
};

export default function HistoryPage() {
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
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Clock className="h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 text-base font-medium">No reading history yet</p>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs">
            Articles you read will automatically appear here so you can revisit them.
          </p>
          <Button variant="outline" className="mt-6" asChild>
            <Link href="/RefinedFeed">Start reading</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}