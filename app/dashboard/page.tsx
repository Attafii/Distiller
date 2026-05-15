import type { Metadata } from "next";
import Link from "next/link";
import { BookMarked, TrendingUp, Clock, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your Distiller dashboard overview"
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your personal news intelligence at a glance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Bookmarks saved", value: "0", icon: BookMarked, href: "/dashboard/bookmarks" },
          { label: "Articles read", value: "0", icon: Clock, href: "/dashboard/history" },
          { label: "Alerts active", value: "0", icon: Zap, href: "/dashboard/alerts" },
          { label: "Current plan", value: "Free", icon: TrendingUp, href: "/dashboard/billing" }
        ].map((stat) => (
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-display text-lg">Recent bookmarks</CardTitle>
            <CardDescription className="text-sm">Your saved stories appear here</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-display text-lg">Your reading history</CardTitle>
            <CardDescription className="text-sm">Articles you have read</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
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
            {[
              { name: "Free", price: "$0", features: ["50 articles/month", "Basic filters", "Email support"], highlighted: false },
              { name: "Pro", price: "$9/mo", features: ["Unlimited articles", "Advanced filters", "Priority support"], highlighted: true },
              { name: "Team", price: "$29/mo", features: ["5 seats", "Shared feeds", "Priority support"], highlighted: false }
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-5 ${
                  plan.highlighted
                    ? "border-primary/30 bg-primary/5 shadow-soft"
                    : "border-border bg-card"
                }`}
              >
                <p className="font-display text-lg font-semibold">{plan.name}</p>
                <p className="mt-1 text-2xl font-bold">{plan.price}</p>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.highlighted ? "default" : "outline"}
                  size="sm"
                  className="mt-5 w-full"
                  asChild
                >
                  <Link href="/pricing">{plan.highlighted ? "Get started" : "Learn more"}</Link>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}