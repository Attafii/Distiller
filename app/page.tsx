import type { Metadata } from "next";
import Link from "next/link";

import { ArrowUpRight, Globe2, Layers, Sparkles, Rss, CheckCircle2, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Distiller — News Intelligence",
  description: "Stay informed in seconds. Get concise news briefings that cut through the noise.",
  alternates: { canonical: "/" }
};

const features = [
  {
    icon: Layers,
    title: "Verified Sources",
    description: "Every brief pulls directly from the original article. No guesswork, no fabrication — just the facts."
  },
  {
    icon: Sparkles,
    title: "Three Bullets",
    description: "Compact briefs with a key insight and a conclusion. Scan the world's news in minutes, not hours."
  },
  {
    icon: Globe2,
    title: "15 Topics, 15 Regions",
    description: "From AI to finance to Tunisia — filter by what matters to you and get exactly your slice of the world."
  },
  {
    icon: Rss,
    title: "Live RSS Feed",
    description: "Subscribe to your personalized briefing via RSS. Stay updated in your favorite reader."
  }
];

const stats = [
  { value: "15", label: "Topics" },
  { value: "15", label: "Regions" },
  { value: "3", label: "Bullets/Article" },
  { value: "Free", label: "To start" }
];

const sampleSummary = {
  category: "Technology",
  headline: "Large Language Models Show Emergent Reasoning Capabilities at Scale",
  bullets: [
    "Models above 70B parameters demonstrate chain-of-thought reasoning without explicit prompting",
    "Scaling laws predict 2x improvement on complex tasks with 4x compute budget increase",
    "Researchers confirm capability emergence is consistent across different architecture families"
  ],
  insight: "The study validates that reasoning emerges predictably at scale, suggesting current frontier models are still on the steep part of the learning curve.",
  source: "arXiv · 2h ago"
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/8 via-transparent to-transparent" />
        </div>

        <div className="mx-auto max-w-5xl px-6 pt-20 pb-16 text-center">
          <Badge variant="outline" className="mb-6 border-border text-muted-foreground">
            <Sparkles className="mr-1.5 h-3 w-3" />
            News intelligence for curious minds
          </Badge>

          <h1 className="font-display text-5xl font-semibold tracking-tight text-foreground sm:text-6xl xl:text-7xl leading-[1.05]">
            The world&apos;s news,<br />
            <span className="text-gradient">three bullets.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Stop skimming hundreds of articles. Distiller delivers concise, verified briefings
            that keep you informed without the information overload.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/auth/signup">
                Start for free
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/RefinedFeed">Browse the feed</Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-6 pb-20">
          <div className="grid gap-4 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border bg-card/50 p-4 text-center">
                <p className="font-display text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <Card className="overflow-hidden border-border bg-card shadow-soft">
          <div className="flex flex-col lg:flex-row">
            <div className="flex-1 p-6 lg:p-8">
              <Badge variant="outline" className="mb-4 border-border text-muted-foreground">
                {sampleSummary.category}
              </Badge>
              <h2 className="font-display text-2xl font-semibold leading-snug text-foreground mb-4">
                {sampleSummary.headline}
              </h2>

              <div className="bullet-list mb-6">
                {sampleSummary.bullets.map((bullet, i) => (
                  <li key={i} className="text-sm leading-relaxed text-muted-foreground">
                    {bullet}
                  </li>
                ))}
              </div>

              <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                <p className="text-xs uppercase tracking-wider text-primary mb-1.5 font-medium">Key insight</p>
                <p className="text-sm leading-relaxed text-foreground">{sampleSummary.insight}</p>
              </div>
            </div>

            <div className="border-t border-border lg:border-t-0 lg:border-l lg:w-72 bg-muted/10 p-6 lg:p-8">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Sample summary</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm text-muted-foreground">3 concise bullets</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm text-muted-foreground">Verified source</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm text-muted-foreground">Key insight + conclusion</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm text-muted-foreground">Source attribution</span>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground">{sampleSummary.source}</p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border bg-card p-5">
              <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-primary/10 mb-4">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-base font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <Card className="border-border bg-card p-8 text-center">
          <Badge variant="outline" className="mb-4 border-border text-muted-foreground">
            100% free to start
          </Badge>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground mb-4">
            No credit card. No catch.
          </h2>
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-muted-foreground mb-8">
            Begin with 50 articles per month on the free plan. Upgrade to Pro for unlimited access,
            advanced filters, and bookmarking. Cancel anytime.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/auth/signup">Create free account</Link>
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link href="/pricing">View all plans</Link>
            </Button>
          </div>
        </Card>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground text-center mb-10">
          Topics we cover
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            "World", "Politics", "Technology", "AI", "Science",
            "Business", "Finance", "Stocks", "Climate",
            "Health", "Education", "Sports", "Entertainment", "Culture", "LLM"
          ].map((topic) => (
            <Link key={topic} href={`/RefinedFeed?category=${topic.toLowerCase()}`}>
              <Button variant="outline" size="sm" className="rounded-full">
                {topic}
              </Button>
            </Link>
          ))}
        </div>
      </section>

      <section id="main-content" className="mx-auto max-w-5xl px-6 pb-24">
        <Card className="border-border bg-card p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex size-14 items-center justify-center rounded-2xl border border-border bg-primary/10 shrink-0">
              <Star className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground mb-2">
                Ready to cut through the noise?
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground max-w-md">
                Join thousands of researchers, developers, and curious readers who use Distiller
                to stay informed in seconds, not hours.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Button asChild>
                <Link href="/auth/signup">Get started free</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/RefinedFeed">Browse feed</Link>
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}