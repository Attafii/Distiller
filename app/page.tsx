import Link from "next/link";
import { ArrowUpRight, Database, Newspaper, Sparkles, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const capabilities = [
  {
    icon: Sparkles,
    title: "Grounded summaries",
    description:
      "Every article is distilled into exactly three concise bullets using retrieval-first context instead of raw prompt sprawl."
  },
  {
    icon: Database,
    title: "Token-aware retrieval",
    description:
      "Embeddings trim the source context before it reaches the NVIDIA Build model, keeping latency and cost under control."
  },
  {
    icon: ShieldCheck,
    title: "Dark, low-noise UI",
    description:
      "A monochrome zinc-and-slate interface keeps attention on the signal, with subtle motion rather than visual clutter."
  }
];

const sampleBullets = [
  "A retrieval step reduces the article to the most relevant snippets before summarization.",
  "The NVIDIA Build model is selected by task size, allowing fast and deeper tiers to coexist.",
  "The resulting card puts the AI summary above the source description for faster scanning."
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
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

        <div className="grid gap-8 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="outline" className="border-zinc-700 text-zinc-300">
                NVIDIA Build · RAG · NewsAPI
              </Badge>
              <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-zinc-50 sm:text-6xl">
                News distilled into a feed that reads like an executive brief.
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
                Distiller turns broad news coverage into a concise, monochrome interface powered by grounded retrieval,
                NVIDIA Build LLM routing, and a strict three-bullet summary format.
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

            <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.24em] text-zinc-500">
              <span>Next.js 15</span>
              <span>•</span>
              <span>Shadcn UI</span>
              <span>•</span>
              <span>Framer Motion</span>
              <span>•</span>
              <span>NVIDIA Build ready</span>
            </div>
          </div>

          <Card className="border-zinc-800 bg-zinc-900/70 shadow-soft backdrop-blur">
            <CardContent className="space-y-5 p-6 sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <Badge variant="default">Live preview</Badge>
                <Badge variant="outline">3 bullets</Badge>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">
                  The AI summary always comes first.
                </h2>
                <p className="text-sm leading-relaxed text-zinc-400">
                  Original article descriptions stay available, but they sit beneath the distilled view so scanning stays fast.
                </p>
              </div>

              <ul className="space-y-3">
                {sampleBullets.map((bullet) => (
                  <li key={bullet} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-200">
                    {bullet}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <section id="why" className="grid gap-5 pb-16 md:grid-cols-3">
          {capabilities.map((item) => {
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
      </section>
    </main>
  );
}
