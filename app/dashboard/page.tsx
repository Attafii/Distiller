import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { BookMarked, TrendingUp, Clock, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { bookmarks, readingHistory, alerts, subscriptions } from "@/lib/db/schema";
import { headers } from "next/headers";
import { eq, count } from "drizzle-orm";
import { getMonthlyArticleUsage, FREE_MONTHLY_ARTICLE_LIMIT } from "@/lib/db/queries";
import { PLAN_LIMITS_DISPLAY } from "@/lib/plans-display";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your Distiller dashboard overview"
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/login");
  }

  const userId = session.user.id;
  const db = getDb();

  const [bookmarkCount, historyCount, alertCount, subscription, monthlyUsage] = await Promise.all([
    db.select({ count: count() }).from(bookmarks).where(eq(bookmarks.userId, userId)).then(r => r[0]?.count ?? 0),
    db.select({ count: count() }).from(readingHistory).where(eq(readingHistory.userId, userId)).then(r => r[0]?.count ?? 0),
    db.select({ count: count() }).from(alerts).where(eq(alerts.userId, userId)).then(r => r[0]?.count ?? 0),
    db.query.subscriptions.findFirst({ where: eq(subscriptions.userId, userId) }),
    getMonthlyArticleUsage(userId)
  ]);

  const planName = subscription?.plan ?? "free";
  const isFreePlan = !planName || planName === "free" || planName === "guest";
  const planLabel = planName.charAt(0).toUpperCase() + planName.slice(1);

  const stats = [
    { label: "Bookmarks saved", value: String(bookmarkCount), icon: BookMarked, href: "/dashboard/bookmarks" },
    { label: "Articles read", value: String(historyCount), icon: Clock, href: "/dashboard/history" },
    { label: "Alerts active", value: String(alertCount), icon: Zap, href: "/dashboard/alerts" },
    { label: "Current plan", value: planLabel, icon: TrendingUp, href: "/dashboard/billing" }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your personal news intelligence at a glance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="border-border bg-card transition-colors hover:border-primary/30 hover:bg-muted/30">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex size-11 items-center justify-center rounded-xl border border-border bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {isFreePlan && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-foreground">This month&apos;s usage</p>
            <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-500/30">Free</Badge>
          </div>
          <div className="h-2 w-full rounded-full bg-muted mb-2">
            <div className="h-2 rounded-full bg-amber-500 transition-all" style={{ width: `${Math.min(100, (monthlyUsage / FREE_MONTHLY_ARTICLE_LIMIT) * 100)}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">{monthlyUsage} of {FREE_MONTHLY_ARTICLE_LIMIT} articles read · {Math.max(0, FREE_MONTHLY_ARTICLE_LIMIT - monthlyUsage)} remaining</p>
          <div className="mt-3">
            <Button size="sm" asChild>
              <Link href="/pricing">Upgrade to Pro →</Link>
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentBookmarks userId={userId} />
        <RecentHistory userId={userId} />
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-display text-lg">Upgrade your plan</CardTitle>
          <CardDescription className="text-sm">
            Unlock unlimited articles, advanced filters, and more
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {PLAN_LIMITS_DISPLAY.filter((p) => p.publiclyVisible).map((plan) => (
              <div
                key={plan.id}
                className={`rounded-2xl border p-5 ${
                  plan.id === "pro"
                    ? "border-primary/30 bg-primary/5 shadow-soft"
                    : "border-border bg-card"
                }`}
              >
                <p className="font-display text-lg font-semibold">{plan.name}</p>
                <p className="mt-1 text-2xl font-bold">
                  {plan.priceMonthly === 0 ? "Free" : `$${plan.priceMonthly}/mo`}
                </p>
                <ul className="mt-4 space-y-2">
                  {plan.features.slice(0, 3).map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.id === "pro" ? "default" : "outline"}
                  size="sm"
                  className="mt-5 w-full"
                  asChild
                >
                  <Link href="/pricing">{plan.id === "pro" ? "Get started" : "Learn more"}</Link>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function RecentBookmarks({ userId }: { userId: string }) {
  const db = getDb();
  const recentBookmarks = await db.query.bookmarks.findMany({
    where: eq(bookmarks.userId, userId),
    orderBy: (bookmarks, { desc }) => [desc(bookmarks.createdAt)],
    limit: 5
  });

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="font-display text-lg">Recent bookmarks</CardTitle>
        <CardDescription className="text-sm">Your saved stories appear here</CardDescription>
      </CardHeader>
      <CardContent>
        {recentBookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <BookMarked className="h-10 w-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">No bookmarks yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Save articles while browsing to read them later
            </p>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link href="/RefinedFeed">Browse feed</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentBookmarks.map((bm) => (
              <a
                key={bm.id}
                href={bm.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-border p-3 hover:bg-muted/30 transition-colors"
              >
                <p className="text-sm font-medium truncate">{bm.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{bm.source ?? "Unknown source"}</p>
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

async function RecentHistory({ userId }: { userId: string }) {
  const db = getDb();
  const recentHistory = await db.query.readingHistory.findMany({
    where: eq(readingHistory.userId, userId),
    orderBy: (readingHistory, { desc }) => [desc(readingHistory.readAt)],
    limit: 5
  });

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="font-display text-lg">Your reading history</CardTitle>
        <CardDescription className="text-sm">Articles you have read</CardDescription>
      </CardHeader>
      <CardContent>
        {recentHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Clock className="h-10 w-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">No history yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Start reading articles to build your history
            </p>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link href="/RefinedFeed">Browse feed</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentHistory.map((entry) => (
              <a
                key={entry.id}
                href={entry.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-border p-3 hover:bg-muted/30 transition-colors"
              >
                <p className="text-sm font-medium truncate">{entry.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {entry.readAt ? new Date(entry.readAt).toLocaleDateString() : ""}
                </p>
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
