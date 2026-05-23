import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Newspaper, ExternalLink } from "lucide-react";

interface BriefPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    title?: string;
    bullets?: string;
    insight?: string;
    sourceName?: string;
    publishedAt?: string;
    url?: string;
  }>;
}

export async function generateMetadata({ searchParams }: BriefPageProps): Promise<Metadata> {
  const params = await searchParams;
  const title = params.title ? decodeURIComponent(params.title) : "Brief";
  const description = params.insight ? decodeURIComponent(params.insight) : "AI-powered news brief from Distiller.";
  return {
    title: `${title} · Distiller`,
    description,
    alternates: { canonical: `https://distiller.attafii.dev/brief/${(params.title ?? "brief").slice(0, 60).replace(/\s+/g, "-").toLowerCase()}` },
    openGraph: {
      title: `${title} · Distiller`,
      description,
      images: [`https://distiller.attafii.dev/api/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description.slice(0, 100))}`],
      type: "article"
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · Distiller`,
      description,
      images: [`https://distiller.attafii.dev/api/og?title=${encodeURIComponent(title)}`]
    }
  };
}

export default async function BriefPage({ searchParams }: BriefPageProps) {
  const queryParams = await searchParams;
  const title = queryParams.title ? decodeURIComponent(queryParams.title) : "Article Brief";
  const bulletsStr = queryParams.bullets ? decodeURIComponent(queryParams.bullets) : "[]";
  let bullets: string[] = [];
  try { bullets = JSON.parse(bulletsStr); } catch { bullets = [title]; }
  const insight = queryParams.insight ? decodeURIComponent(queryParams.insight) : null;
  const sourceName = queryParams.sourceName ? decodeURIComponent(queryParams.sourceName) : "Unknown source";
  const publishedAt = queryParams.publishedAt ? new Date(queryParams.publishedAt).toLocaleDateString("en-US", { dateStyle: "long" }) : "";
  const url = queryParams.url && queryParams.url !== "#" ? queryParams.url : null;

  const shareText = `🗞 ${title} — distilled in 3 bullets\nvia @distillerdev`;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-primary text-primary-foreground shadow-sm">
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M4 6h16M4 12h12M4 18h8" />
              </svg>
            </div>
            <div>
              <p className="font-display text-lg font-semibold tracking-tight">Distiller</p>
              <p className="text-xs text-muted-foreground">News Intelligence</p>
            </div>
          </Link>
          <Link href="/RefinedFeed">
            <Button variant="outline" size="sm">← Back to feed</Button>
          </Link>
        </div>

        <article>
          <header className="mb-8">
            <Badge variant="default" className="mb-4 font-medium">
              <Newspaper className="mr-1.5 h-3.5 w-3.5" />
              AI Brief
            </Badge>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl mb-4 leading-tight">
              {title}
            </h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{sourceName}</span>
              {publishedAt && <><span aria-hidden="true">·</span><time>{publishedAt}</time></>}
            </div>
          </header>

          <Card className="mb-8 border-border bg-card">
            <CardContent className="space-y-4 p-6 sm:p-8">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">3 Key Points</p>
              <ul className="space-y-4" role="list">
                {bullets.map((bullet, i) => (
                  <li key={i} className="rounded-xl border border-border bg-muted/30 px-5 py-4 text-base leading-relaxed text-foreground">
                    {bullet}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {insight && (
            <Card className="mb-8 border-cyan-500/20 bg-cyan-500/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mb-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-500" />
                  Key Insight
                </div>
                <p className="text-base leading-relaxed text-foreground">{insight}</p>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-wrap gap-4">
            {url && url !== "#" && (
              <a href={url} target="_blank" rel="noopener noreferrer">
                <Button className="gap-2">
                  Read original article <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            )}
            <a href={twitterUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2">
                Share on X
              </Button>
            </a>
            <Link href="/RefinedFeed">
              <Button variant="ghost">Explore more →</Button>
            </Link>
          </div>
        </article>

        <div className="mt-16 pt-8 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Briefed by{" "}
            <a href="https://distiller.attafii.dev" className="text-primary hover:underline">Distiller</a>
            {" "}— AI-powered news intelligence
          </p>
        </div>
      </div>
    </main>
  );
}