"use client";

import Link from "next/link";

import { motion } from "framer-motion";
import { ArrowUpRight, Database, Globe, Layers3, Newspaper, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
    title: "Broader regional coverage",
    description:
      "The region list starts with Global and Tunisia, then expands into other markets for a more useful daily scan."
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
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_transparent_60%)]"
      />

      <section className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between rounded-full border border-zinc-800 bg-zinc-900/70 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-950 text-zinc-100">
              <Newspaper className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">Distiller</p>
              <p className="text-xs text-zinc-500">AI news intelligence</p>
            </div>
          </div>

          <Link
            href="/RefinedFeed"
            className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-300"
          >
            Open refined feed
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </nav>

        <div className="grid gap-8 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <Badge variant="outline" className="border-zinc-700 text-zinc-300">
                RAG · embeddings · our AI and API service
              </Badge>
              <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-zinc-50 sm:text-6xl">
                News distilled into a feed that reads like an executive brief.
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
                Distiller turns broad coverage into a concise, monochrome interface using our AI and API service, RAG,
                and embeddings. Each article is grounded before it is summarized, so readers can trust the brief and move on.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/RefinedFeed"
                className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-5 py-3 text-sm font-medium text-zinc-950 transition hover:bg-zinc-300"
              >
                Start reading
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <a
                href="#why"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950 px-5 py-3 text-sm font-medium text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-900"
              >
                Why it works
              </a>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-soft">
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">What readers get</p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                  Three bullet summaries, source context, and an easy path back to the original article.
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-soft">
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Coverage</p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                  Global, Tunisia, and a wider set of topics across policy, markets, science, culture, and more.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.08 }}
          >
            <Card className="border-zinc-800 bg-zinc-900/70 shadow-soft backdrop-blur">
              <CardContent className="space-y-5 p-6 sm:p-8">
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="default">Live preview</Badge>
                  <Badge variant="outline">RAG + embeddings</Badge>
                </div>

                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">How the summary stays grounded</h2>
                  <p className="text-sm leading-relaxed text-zinc-400">
                    Embeddings find the best source passages first, and RAG uses that context to keep the summary specific,
                    readable, and easier to trust.
                  </p>
                </div>

                <ul className="space-y-3">
                  {sampleBullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm leading-relaxed text-zinc-200"
                    >
                      {bullet}
                    </li>
                  ))}
                </ul>

                <div className="grid gap-3 sm:grid-cols-2">
                  {workflowSteps.map((step) => (
                    <div key={step.title} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{step.title}</p>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-300">{step.copy}</p>
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
              <Card key={item.title} className="border-zinc-800 bg-zinc-900/60 shadow-soft">
                <CardContent className="space-y-4 p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-100">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-zinc-400">{item.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-5 pb-16 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-zinc-800 bg-zinc-900/60 shadow-soft">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Topics</p>
                <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                  {TOPIC_OPTIONS.length} topics
                </Badge>
              </div>

              <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
                More topic chips mean more ways to browse the feed, from politics and finance to climate, education, and culture.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {TOPIC_OPTIONS.map((option) => (
                  <Badge key={option.id} variant="outline" className="border-zinc-800 bg-zinc-950/70 text-zinc-300">
                    {option.label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/60 shadow-soft">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Regions</p>
                <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                  {COUNTRY_OPTIONS.length} regions
                </Badge>
              </div>

              <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
                The region list starts with Global, then Tunisia, and then the broader international set so local coverage stays easy to reach.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {COUNTRY_OPTIONS.map((option) => (
                  <Badge key={option.id} variant="outline" className="border-zinc-800 bg-zinc-950/70 text-zinc-300">
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
