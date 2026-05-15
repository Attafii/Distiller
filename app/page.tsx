import type { Metadata } from "next";
import Link from "next/link";

import { ArrowUpRight, BarChart3, BookOpen, CheckCircle2, Cpu, Globe2, Layers3, Rss, Sparkles, Star, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Distiller — AI News Intelligence",
  description: "Get concise 3-bullet AI summaries of top stories, grounded with RAG and embeddings. Skip the noise, stay informed in seconds.",
  alternates: {
    canonical: "/"
  }
};

const features = [
  {
    icon: Layers3,
    title: "RAG-Grounded Summaries",
    description: "Every brief pulls from actual article passages. No hallucination, no vague summaries — just grounded intelligence."
  },
  {
    icon: Cpu,
    title: "NVIDIA Embeddings",
    description: "Vector search finds the most relevant snippets before summarization, keeping the feed fast and accurate."
  },
  {
    icon: Zap,
    title: "Three Bullets, One Read",
    description: "Compact briefs with a key insight and a conclusion. Scan the world's news in minutes, not hours."
  },
  {
    icon: Globe2,
    title: "13 Regions, 15 Topics",
    description: "From Tunis to Tokyo, AI to LLM — filter by what matters to you and get exactly your slice of the world."
  }
];

const stats = [
  { value: "15", label: "Topics" },
  { value: "13", label: "Regions" },
  { value: "3", label: "Bullets/Article" },
  { value: "<2s", label: "Per Summary" }
];

const sampleSummary = {
  category: "AI Research",
  headline: "Large Language Models Show Emergent Reasoning Capabilities at Scale",
  bullets: [
    "Models above 70B parameters demonstrate chain-of-thought reasoning without explicit prompting",
    "Scalinglaws predict 2x improvement on complex tasks with 4x compute budget increase",
    "Researchers confirm capability emergence is consistent across different architecture families"
  ],
  insight: "The study validates that reasoning emerges predictably at scale, suggesting current frontier models are still on the steep part of the learning curve.",
  source: "arXiv · 2h ago"
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-primary text-primary-foreground shadow-sm">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M4 6h16M4 12h12M4 18h8" />
              </svg>
            </div>
            <div>
              <p className="font-display text-lg font-semibold tracking-tight">Distiller</p>
              <p className="text-xs text-muted-foreground">AI News Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/RefinedFeed">
              <Button size="sm" className="gap-2 font-medium">
                Start reading
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <div id="main-content">
        {/* Hero Section */}
        <section className="relative pt-16 pb-24">
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,_hsl(245_65%_45%_/_0.06),_transparent_70%)]}" />
          </div>

          <div className="relative mx-auto max-w-7xl px-6">
            <div className="grid gap-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
              {/* Left: Editorial copy */}
              <div className="space-y-8">
                <div className="space-y-6">
                  <Badge variant="outline" className="font-normal text-muted-foreground">
                    <Sparkles className="mr-1.5 h-3 w-3 text-primary" />
                    Powered by RAG + NVIDIA Build
                  </Badge>

                  <h1 className="font-display text-5xl font-semibold tracking-tight text-foreground sm:text-6xl xl:text-7xl leading-[1.05]">
                    News distilled into{" "}
                    <span className="text-gradient">executive briefs.</span>
                  </h1>

                  <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                    Skip the noise. Our AI reads the stories so you don&apos;t have to — 
                    then delivers exactly three takeaways, grounded in the source text.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <Link href="/RefinedFeed" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:shadow-md hover:shadow-primary/20">
                    Open the feed
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link href="/RefinedFeed?category=ai" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-all hover:border-primary/40 hover:bg-secondary/50">
                    Browse AI news
                  </Link>
                </div>

                <div className="flex items-center gap-8 pt-4 border-t border-border/60">
                  {stats.map((stat) => (
                    <div key={stat.label} className="text-center">
                      <p className="font-display text-3xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Live preview card */}
              <div className="relative lg:sticky lg:top-28">
                <div className="rounded-2xl border border-border/80 bg-card shadow-lg shadow-foreground/5 overflow-hidden">
                  <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="font-normal">
                        <Sparkles className="mr-1 h-2.5 w-2.5" />
                        AI Summary
                      </Badge>
                      <span className="text-xs text-muted-foreground">98% confidence</span>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{sampleSummary.category}</span>
                  </div>
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="font-display text-lg font-semibold leading-snug text-foreground mb-2">
                        {sampleSummary.headline}
                      </h3>
                      <p className="text-xs text-muted-foreground">{sampleSummary.source}</p>
                    </div>
                    <ul className="space-y-2.5">
                      {sampleSummary.bullets.map((bullet, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                          <span className="text-sm leading-relaxed text-foreground">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-3 border-t border-border/60">
                      <p className="text-xs text-muted-foreground mb-1">AI insight</p>
                      <p className="text-sm leading-relaxed text-foreground">{sampleSummary.insight}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="mx-auto max-w-7xl px-6"><div className="divider-fade" /></div>

        {/* Features Grid */}
        <section className="py-20" aria-labelledby="features-heading">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 max-w-2xl">
              <h2 id="features-heading" className="font-display text-3xl font-semibold tracking-tight text-foreground mb-4">
                How Distiller works
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                From raw articles to distilled intelligence — in three steps, powered by retrieval-augmented generation.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="card-premium border-border/60">
                    <CardContent className="space-y-4 p-6">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/80 bg-muted/50 text-foreground">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-display text-base font-semibold text-foreground">{feature.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-muted/30 border-y border-border/60" aria-labelledby="how-heading">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 max-w-2xl">
              <h2 id="how-heading" className="font-display text-3xl font-semibold tracking-tight text-foreground mb-4">
                The Distiller pipeline
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                Four steps from raw news to grounded brief.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {[
                { step: "01", title: "Collect", desc: "Pull fresh stories from our API-backed pipeline — NewsAPI, RSS, and niche sources." },
                { step: "02", title: "Retrieve", desc: "Embeddings vector-search finds the most relevant supporting passages for each story." },
                { step: "03", title: "Compose", desc: "RAGGrounded AI turns the article and context into three concise bullets." },
                { step: "04", title: "Scan", desc: "Readers get a brief, a source note, and one click to the original story." }
              ].map((item) => (
                <div key={item.step} className="relative">
                  <span className="font-mono text-5xl font-bold text-border/60 -mb-2 block">{item.step}</span>
                  <h3 className="font-display text-lg font-semibold text-foreground mt-0 mb-2">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Coverage Topics */}
        <section className="py-20" aria-labelledby="topics-heading">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 flex items-end justify-between">
              <div className="max-w-2xl">
                <h2 id="topics-heading" className="font-display text-3xl font-semibold tracking-tight text-foreground mb-4">
                  Comprehensive coverage
                </h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  From global politics to local tech scenes — filter by what matters to you.
                </p>
              </div>
              <Link href="/RefinedFeed">
                <Button variant="outline" size="sm" className="gap-2">
                  Explore all
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                { name: "Technology", icon: Cpu, desc: "AI, software, hardware, startups" },
                { name: "Science", icon: BookOpen, desc: "Research, discoveries, climate" },
                { name: "Business", icon: BarChart3, desc: "Markets, finance, economy" },
                { name: "Politics", icon: Globe2, desc: "Policy, elections, diplomacy" },
                { name: "Health", icon: Star, desc: "Medicine, wellness, nutrition" },
                { name: "AI & LLM", icon: Sparkles, desc: "Artificial intelligence, language models" }
              ].map((topic) => {
                const Icon = topic.icon;
                return (
                  <Link
                    key={topic.name}
                    href={`/RefinedFeed?category=${topic.name.toLowerCase().replace(/[^a-z]/g, "")}`}
                    className="group rounded-xl border border-border/60 bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-muted/50 text-foreground group-hover:border-primary/30">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="font-display text-base font-semibold text-foreground">{topic.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{topic.desc}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-muted/30 border-y border-border/60" aria-labelledby="cta-heading">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <h2 id="cta-heading" className="font-display text-4xl font-semibold tracking-tight text-foreground mb-6">
              Stay informed, not overwhelmed.
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-10">
              Join thousands of readers who start their day with Distiller — the AI-powered news briefing that respects your time.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/RefinedFeed" className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-sm transition-all hover:shadow-md hover:shadow-primary/20">
                Try it free
                <ArrowUpRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/60 py-12">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-primary text-primary-foreground">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M4 6h16M4 12h12M4 18h8" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">Distiller — AI News Intelligence</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Built with Next.js, NVIDIA Build, and RAG
          </p>
        </div>
      </footer>
    </main>
  );
}