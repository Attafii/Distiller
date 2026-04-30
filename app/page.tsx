"use client";

import Link from "next/link";

import { motion } from "framer-motion";
import { ArrowUpRight, Database, Globe, Layers3, Newspaper, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { GitHubRepoWidget } from "@/components/GitHubRepoWidget";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { COUNTRY_OPTIONS, TOPIC_OPTIONS } from "@/lib/news-options";

const featureCards = [
  {
    icon: Sparkles,
    title: "RAG-first summaries",
    description:
      "Every brief is grounded in retrieved passages before the model writes, so the summary stays tied to the article."
  },
  {
    icon: Database,
    title: "Embeddings trim the noise",
    description:
      "We surface the most relevant snippets first, which keeps the feed fast and gives the model less irrelevant context."
  },
  {
    icon: Layers3,
    title: "Three bullets, one quick read",
    description:
      "Readers get a compact brief, a source note, and the original story without digging through extra clutter."
  },
  {
    icon: Globe,
    title: "Ask the assistant follow-ups",
    description:
      "Readers can ask for a specific story, company, or event and get a grounded answer with the best matching sources."
  }
];

const sampleBullets = [
  "Embeddings surface the most relevant passages before summarization.",
  "RAG keeps the brief anchored to the article instead of the prompt alone.",
  "The source description and original link stay one click away when you need more context."
];

const workflowSteps = [
  {
    title: "Collect",
    copy: "Pull fresh stories from an API-backed pipeline."
  },
  {
    title: "Retrieve",
    copy: "Use embeddings to find the best supporting context."
  },
  {
    title: "Compose",
    copy: "Let RAG turn the article into a concise brief."
  },
  {
    title: "Scan",
    copy: "Move from summary to source without losing the thread."
  }
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-transparent text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.22),_transparent_62%)]"
      />

      <section className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between rounded-full border border-border bg-white/85 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary text-foreground">
              <Newspaper className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">Distiller</p>
              <p className="text-xs text-muted-foreground">AI news intelligence</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ThemeSwitcher />
            <GitHubRepoWidget />
            <Link
              href="/RefinedFeed"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:brightness-95"
            >
              Open refined feed
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </nav>

        <div className="grid gap-8 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <Badge variant="outline" className="border-border text-muted-foreground">
                RAG · embeddings · our AI and API service
              </Badge>
              <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
                News distilled into a feed that reads like an executive brief.
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Distiller turns broad coverage into a concise, monochrome interface using our AI and API service, RAG,
                and embeddings. Each article is grounded before it is summarized, and the assistant can search for a
                specific story or update when you need a deeper answer.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/RefinedFeed"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:brightness-95"
              >
                Start reading
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <a
                href="#why"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-medium text-foreground transition hover:border-primary/40 hover:bg-secondary"
              >
                Why it works
              </a>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-soft">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">What readers get</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Three bullet summaries, source context, and an easy path back to the original article.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-soft">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Coverage</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Global, Tunisia, China, Russia, and a wider set of topics across policy, markets, science, culture, AI, and LLM news.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.08 }}
          >
            <Card className="border-border bg-card/90 shadow-soft backdrop-blur">
              <CardContent className="space-y-5 p-6 sm:p-8">
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="default">Live preview</Badge>
                  <Badge variant="outline">RAG + embeddings</Badge>
                </div>

                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">How the summary stays grounded</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Embeddings find the best source passages first, and RAG uses that context to keep the summary specific,
                    readable, and easier to trust.
                  </p>
                </div>

                <ul className="space-y-3">
                  {sampleBullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="rounded-2xl border border-border bg-card/75 px-4 py-3 text-sm leading-relaxed text-muted-foreground"
                    >
                      {bullet}
                    </li>
                  ))}
                </ul>

                <div className="grid gap-3 sm:grid-cols-2">
                  {workflowSteps.map((step) => (
                    <div key={step.title} className="rounded-2xl border border-border bg-card/75 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{step.title}</p>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.copy}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <section id="why" className="grid gap-5 pb-16 md:grid-cols-2 xl:grid-cols-4">
          {featureCards.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.title} className="border-border bg-card/60 shadow-soft">
                <CardContent className="space-y-4 p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-secondary text-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                      <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-5 pb-16 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-border bg-card/80 shadow-soft">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Topics</p>
                <Badge variant="outline" className="border-border text-muted-foreground">
                  {TOPIC_OPTIONS.length} topics
                </Badge>
              </div>

              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                More topic chips mean more ways to browse the feed, from politics and finance to climate, education, AI, LLMs, and culture.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {TOPIC_OPTIONS.map((option) => (
                  <Badge key={option.id} variant="outline" className="border-border bg-card/75 text-muted-foreground">
                    {option.label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/80 shadow-soft">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Regions</p>
                <Badge variant="outline" className="border-border text-muted-foreground">
                  {COUNTRY_OPTIONS.length} regions
                </Badge>
              </div>

              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                The region list starts with Global, then Tunisia, China, Russia, and the broader international set so local coverage stays easy to reach.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {COUNTRY_OPTIONS.map((option) => (
                  <Badge key={option.id} variant="outline" className="border-border bg-card/75 text-muted-foreground">
                    {option.label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </section>
    </main>
  );
}
