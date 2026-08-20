import type { Metadata } from "next";
import Link from "next/link";

import { ArrowUpRight, Globe2, Layers, Sparkles, Rss, CheckCircle2, Star, Check, Minus } from "lucide-react";

import { AskTheNewsForm } from "@/components/AskTheNewsForm";
import { HeroTerminal } from "@/components/HeroTerminal";
import { ScrollReveal, StaggerChildren } from "@/components/ScrollReveal";
import { RevealSection } from "@/components/RevealSection";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://distiller.attafii.dev";

export const metadata: Metadata = {
  title: "Distiller — News Intelligence",
  description: "Stay informed in seconds. Get concise news briefings that cut through the noise.",
  alternates: { canonical: `${siteUrl}/` },
  openGraph: {
    url: `${siteUrl}/`,
    title: "Distiller — News Intelligence",
    description: "Stay informed in seconds. Get concise news briefings that cut through the noise.",
    images: [{ url: `${siteUrl}/api/og`, width: 1200, height: 630, alt: "Distiller" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Distiller — News Intelligence",
    description: "Stay informed in seconds. Get concise news briefings that cut through the noise.",
    images: [`${siteUrl}/api/og`]
  }
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
    description: "Subscribe via RSS (Pro). Stay updated in your favorite reader app — Feedly, NetNewsWire, or any RSS client."
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
          <ScrollReveal animation="fade-up" delay={0}>
            <Badge variant="outline" className="mb-6 border-border text-muted-foreground">
              <Sparkles className="mr-1.5 h-3 w-3" />
              News intelligence for curious minds
            </Badge>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={0.1}>
            <h1 className="font-display text-5xl font-semibold tracking-tight text-foreground sm:text-6xl xl:text-7xl 2xl:text-8xl leading-[1.05]">
              The world&apos;s news,<br />
              <span className="text-gradient">three bullets.</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Stop skimming hundreds of articles. Distiller delivers concise, verified briefings
              that keep you informed without the information overload.
            </p>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={0.3}>
            <AskTheNewsForm />
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={0.4}>
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
            <p className="mt-4 text-sm text-muted-foreground">
              7-day Pro trial included · No credit card required
            </p>
          </ScrollReveal>
        </div>

        {/* Terminal demo */}
        <HeroTerminal />

        <div className="mx-auto max-w-5xl px-6 pb-20 pt-16">
          <StaggerChildren staggerDelay={0.1} className="grid gap-4 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border bg-card/50 p-4 text-center transition-all hover:border-primary/30 hover:bg-card hover:shadow-soft">
                <p className="font-display text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
          </StaggerChildren>
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

      <RevealSection className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border bg-card p-5">
              <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-primary/10 mb-4">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-display text-base font-semibold text-foreground">{feature.title}</h3>
                {feature.title === "Live RSS Feed" && (
                  <Badge variant="default" className="text-xs">Pro</Badge>
                )}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="mx-auto max-w-5xl px-6 pb-24" aria-label="How Distiller grounds every brief">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground text-center mb-2">
          How Distiller grounds every brief
        </h2>
        <p className="text-center text-sm text-muted-foreground mb-10">Every bullet traces back to source evidence. No guessing, no fabrication.</p>
        <div className="grid gap-6 sm:grid-cols-5">
          {[
            { step: "1", label: "Article", desc: "NewsAPI fetches the original story" },
            { step: "2", label: "Chunks", desc: "Text split into ~900-char semantic blocks" },
            { step: "3", label: "Embeddings", desc: "NVIDIA Build encodes query + chunks" },
            { step: "4", label: "Snippets", desc: "Top 3 retrieved by cosine similarity" },
            { step: "5", label: "Summary", desc: "LLM generates 3 grounded bullets" }
          ].map(({ step, label, desc }) => (
            <div key={step} className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-lg mb-3">{step}</div>
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="mx-auto max-w-5xl px-6 pb-24">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground text-center mb-10">
          Free vs Pro
        </h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border bg-card p-6">
            <p className="font-display text-xl font-semibold mb-4">Free</p>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-foreground"><Check className="h-4 w-4 text-primary" /> 50 articles/month</div>
              <div className="flex items-center gap-2 text-sm text-foreground"><Check className="h-4 w-4 text-primary" /> 2 topics</div>
              <div className="flex items-center gap-2 text-sm text-foreground"><Check className="h-4 w-4 text-primary" /> 2 regions</div>
              <div className="flex items-center gap-2 text-sm text-foreground"><Check className="h-4 w-4 text-primary" /> Basic filters</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground/50"><Minus className="h-4 w-4" /> Deep summaries</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground/50"><Minus className="h-4 w-4" /> Bookmarks</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground/50"><Minus className="h-4 w-4" /> Daily email briefing</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground/50"><Minus className="h-4 w-4" /> RSS feed</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground/50"><Minus className="h-4 w-4" /> Shareable briefs</div>
            </div>
          </Card>
          <Card className="border-border bg-card p-6 ring-1 ring-primary/15">
            <div className="flex items-center gap-2 mb-4">
              <p className="font-display text-xl font-semibold">Pro</p>
              <Badge variant="default" className="text-xs">Most popular</Badge>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-foreground"><Check className="h-4 w-4 text-primary" /> Unlimited articles</div>
              <div className="flex items-center gap-2 text-sm text-foreground"><Check className="h-4 w-4 text-primary" /> All 15 topics</div>
              <div className="flex items-center gap-2 text-sm text-foreground"><Check className="h-4 w-4 text-primary" /> All 15 regions</div>
              <div className="flex items-center gap-2 text-sm text-foreground"><Check className="h-4 w-4 text-primary" /> Advanced filters + Deep mode</div>
              <div className="flex items-center gap-2 text-sm text-foreground"><Check className="h-4 w-4 text-primary" /> Bookmarks</div>
              <div className="flex items-center gap-2 text-sm text-foreground"><Check className="h-4 w-4 text-primary" /> Daily email briefing</div>
              <div className="flex items-center gap-2 text-sm text-foreground"><Check className="h-4 w-4 text-primary" /> RSS feed</div>
              <div className="flex items-center gap-2 text-sm text-foreground"><Check className="h-4 w-4 text-primary" /> Shareable briefs</div>
            </div>
            <Button className="mt-5 w-full" asChild>
              <Link href="/auth/signup">Start 7-day free trial</Link>
            </Button>
          </Card>
        </div>
      </RevealSection>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-foreground mb-1">Deep Summary Mode</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Pro readers get extended briefs — more context, more nuance, same zero fluff. Switch modes per article or set it as your default.
              </p>
            </div>
          </div>
        </div>
      </section>

      <RevealSection className="mx-auto max-w-5xl px-6 pb-24">
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
      </RevealSection>

      <RevealSection className="mx-auto max-w-5xl px-6 pb-24">
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
      </RevealSection>

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
                Join researchers, developers, and curious readers who stay informed in seconds, not hours.
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