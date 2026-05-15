import type { Metadata } from "next";
import Link from "next/link";

import { ArrowUpRight, Zap, Globe, Brain, Sparkles } from "lucide-react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Distiller",
  description: "AI-powered news intelligence. Get concise 3-bullet summaries of top stories, grounded with RAG and embeddings. Stay informed in seconds.",
  alternates: {
    canonical: "/"
  }
};

const features = [
  {
    icon: Brain,
    title: "RAG-Powered",
    description: "Every summary is grounded in retrieved passages before generation, keeping facts accurate.",
    color: "cyan"
  },
  {
    icon: Zap,
    title: "Instant Briefs",
    description: "Three bullets per article. Scan the world's news in minutes, not hours.",
    color: "amber"
  },
  {
    icon: Globe,
    title: "Global Coverage",
    description: "From Tunis to Tokyo — 13 regions and 12 topics for comprehensive awareness.",
    color: "emerald"
  },
  {
    icon: Sparkles,
    title: "Smart Routing",
    description: "Fast for headlines, deep for analysis. AI tier routing matches complexity to your needs.",
    color: "violet"
  }
];

const stats = [
  { value: "12", label: "Topics" },
  { value: "13", label: "Regions" },
  { value: "3", label: "Bullets/Article" },
  { value: "<2s", label: "Per Summary" }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <header className="fixed top-0 left-0 right-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M4 6h16M4 12h12M4 18h8" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">Distiller</p>
              <p className="text-xs text-muted-foreground">AI News Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button asChild size="sm" className="gap-2 font-semibold">
              <Link href="/RefinedFeed">
                Start reading
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      <section id="main-content" className="relative pt-32 pb-20" aria-labelledby="hero-heading">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" aria-hidden="true" />
          <div className="absolute top-40 right-1/4 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" aria-hidden="true" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-12 lg:items-center">
            <div className="space-y-8">
              <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                Powered by NVIDIA Build + RAG
              </Badge>

              <h1 id="hero-heading" className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl xl:text-7xl leading-[1.1]">
                News distilled into{" "}
                <span className="bg-gradient-to-r from-cyan-600 via-violet-600 to-amber-500 bg-clip-text text-transparent">
                  executive briefs.
                </span>
              </h1>

              <p className="max-w-lg text-lg text-muted-foreground leading-relaxed">
                Skip the noise. Our AI reads the stories so you don&apos;t have to — 
                then delivers exactly three takeaways, grounded in the source text.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="h-12 gap-2 text-base font-semibold px-6">
                  <Link href="/RefinedFeed">
                    Open the feed
                    <ArrowUpRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 gap-2 text-base font-medium px-6">
                  <Link href="/RefinedFeed?category=tech&country=us">
                    Browse tech news
                  </Link>
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4 border-t border-border">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative" aria-hidden="true">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-violet-500/20 rounded-3xl blur-2xl" />
              <div className="relative rounded-3xl border border-border bg-card p-8 shadow-2xl">
                <div className="mb-6 flex items-center justify-between">
                  <Badge className="gap-1.5 bg-cyan-500/10 text-cyan-600 border-cyan-500/20">
                    <Sparkles className="h-3 w-3" />
                    AI Summary
                  </Badge>
                  <span className="text-xs text-muted-foreground">98% confidence</span>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Key Insight</p>
                    <p className="text-sm text-foreground leading-relaxed">
                      Open-source AI copilots are moving deeper into newsroom workflows, with retrieval-first assistants keeping summaries grounded.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Bullet Points</p>
                    {["Editorial teams report 40% faster briefing prep with AI assistants.", "Retrieval verification reduces factual errors by 60% in beta tests.", "Newsrooms prioritize open-source tools for transparency and control."].map((bullet, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-500 shrink-0" />
                        <p className="text-sm text-foreground leading-relaxed">{bullet}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">TechCrunch</span>
                    </div>
                    <span className="text-xs text-muted-foreground">2h ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-border" aria-labelledby="features-heading">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <h2 id="features-heading" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
              How it works
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              From raw articles to distilled intelligence — in three steps.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const colorClasses: Record<string, string> = {
                cyan: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
                amber: "bg-amber-500/10 text-amber-600 border-amber-500/20",
                emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                violet: "bg-violet-500/10 text-violet-600 border-violet-500/20"
              };

              return (
                <div
                  key={feature.title}
                  className="relative rounded-2xl border border-border bg-card p-6 shadow-card"
                >
                  <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground border border-border">
                    {index + 1}
                  </div>
                  <div className={`inline-flex items-center justify-center rounded-xl border p-2.5 mb-4 ${colorClasses[feature.color]}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30 border-y border-border" aria-labelledby="topics-heading">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 id="topics-heading" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
              Comprehensive coverage
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              From global politics to local tech scenes — filter by what matters to you.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Technology", icon: "💻", desc: "AI, software, hardware, startups" },
              { name: "Science", icon: "🔬", desc: "Research, discoveries, climate" },
              { name: "Business", icon: "📈", desc: "Markets, finance, economy" },
              { name: "Politics", icon: "🏛️", desc: "Policy, elections, diplomacy" },
              { name: "Health", icon: "🏥", desc: "Medicine, wellness, nutrition" },
              { name: "Climate", icon: "🌍", desc: "Environment, sustainability, energy" }
            ].map((topic) => (
              <Link
                key={topic.name}
                href={`/RefinedFeed?category=${topic.name.toLowerCase()}`}
                className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-elevated hover:border-primary/30"
              >
                <span className="text-3xl mb-3 block" role="img" aria-hidden="true">{topic.icon}</span>
                <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{topic.name}</h3>
                <p className="text-sm text-muted-foreground">{topic.desc}</p>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button asChild variant="outline" className="gap-2">
              <Link href="/RefinedFeed">
                Explore all topics
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-24 text-center" aria-labelledby="cta-heading">
        <div className="mx-auto max-w-3xl px-6">
          <h2 id="cta-heading" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
            Stay informed, not overwhelmed.
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Join thousands of readers who start their day with Distiller — the AI-powered news briefing that respects your time.
          </p>
          <Button asChild size="lg" className="h-12 gap-2 text-base font-semibold px-8">
            <Link href="/RefinedFeed">
              Try it now — it&apos;s free
              <ArrowUpRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
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