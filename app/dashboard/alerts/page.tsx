import type { Metadata } from "next";
import Link from "next/link";
import { Bell, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Alerts",
  description: "Your keyword alerts"
};

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Alerts</h1>
          <p className="mt-2 text-sm text-muted-foreground">Get notified when keywords appear in the news.</p>
        </div>
        <Button asChild>
          <Link href="/RefinedFeed">
            <Plus className="h-4 w-4" />
            Create alert
          </Link>
        </Button>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Bell className="h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 text-base font-medium">No alerts set up yet</p>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs">
            Create keyword alerts to get notified when specific topics appear in the feed.
          </p>
          <Button variant="outline" className="mt-6" asChild>
            <Link href="/RefinedFeed">Browse topics</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}