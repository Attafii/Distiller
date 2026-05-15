import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";

export const metadata = {
  title: "Page Not Found · Distiller",
  robots: {
    index: false,
    follow: false
  }
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md border-border bg-card shadow-elevated">
        <CardContent className="space-y-6 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Search className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              The page you&apos;re looking for doesn&apos;t exist or may have been moved. Try searching for what you need or head back to the feed.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="w-full">
              <Link href="/RefinedFeed">
                Browse the feed
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                Go home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}