import type { Metadata } from "next";
import Link from "next/link";
import { Globe2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://distiller.attafii.dev";

export const metadata: Metadata = {
  title: "MENA & Africa · Distiller",
  description: "Coverage of Tunisia, Egypt, Nigeria, Kenya, Morocco, Saudi Arabia, UAE, and across the continent. North Africa and MENA news distilled in 3 bullets.",
  keywords: ["Tunisia news", "MENA news", "Africa startup news", "arabic news summary", "North Africa", "Middle East", "African news"],
  alternates: { canonical: `${siteUrl}/mena` },
  openGraph: {
    url: `${siteUrl}/mena`,
    title: "MENA & Africa · Distiller",
    description: "North Africa and MENA news distilled in 3 bullets.",
    images: [{ url: `${siteUrl}/api/og?title=MENA+and+Africa`, width: 1200, height: 630, alt: "MENA Edition" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "MENA & Africa · Distiller",
    images: [`${siteUrl}/api/og?title=MENA+and+Africa`]
  }
};

export default function MenaPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <Badge variant="outline" className="mb-6 border-border text-muted-foreground">
          <Globe2 className="mr-1.5 h-3 w-3" />
          MENA & Africa Edition
        </Badge>
        <h1 className="font-display text-5xl font-semibold tracking-tight text-foreground sm:text-6xl mb-6">
          Your slice of the world&apos;s<br />
          <span className="text-gradient">most dynamic region.</span>
        </h1>
        <p className="mx-auto max-w-2xl 2xl:max-w-3xl text-lg leading-relaxed text-muted-foreground mb-8">
          Coverage of Tunisia, Egypt, Nigeria, Kenya, Morocco, Saudi Arabia, UAE, and across the continent —
          distilled in 3 bullets per story.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/RefinedFeed?country=tn">Browse Tunisia</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/RefinedFeed">Browse all regions</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground mb-6">
          Featured from the region
        </h2>
        <div className="grid gap-6 lg:grid-cols-2">
          {[
            {
              category: "World · MENA",
              title: "Tunisia Signs €400M Green Energy Partnership with the EU",
              bullets: ["Solar installation across three southern governorates", "12,000 direct jobs expected", "Knowledge transfer requires 60% local engineering"],
              insight: "One of the largest EU-Tunisia energy deals to date.",
              source: "Reuters Africa · 6h ago"
            },
            {
              category: "Business · Africa",
              title: "Africa's Startup Funding Hits $4.2B in Q1 2026",
              bullets: ["Nigeria, Kenya, Egypt account for 68% of funding", "Fintech dominates at 41% of deals", "Median deal size grew to $2.8M"],
              insight: "African startup capital is maturing — larger rounds signal conviction.",
              source: "TechCabal · 14h ago"
            },
            {
              category: "Technology · MENA",
              title: "Saudi Arabia Launches $10B AI Infrastructure Fund",
              bullets: ["Fund managed by Public Investment Fund", "Targets data centers across the GCC", "Open to international tech partnerships"],
              insight: "The kingdom is positioning itself as the AI hub of the Middle East.",
              source: "Financial Times · 1d ago"
            },
            {
              category: "Health · Africa",
              title: "Nigeria Deploys WHO-Approved Malaria Vaccine Nationwide",
              bullets: ["RTS,S vaccine reaches 3.2M children in pilot program", "37% reduction in severe cases observed", "WHO prequalification enables bulk procurement"],
              insight: "A milestone for child health in Africa's most populous nation.",
              source: "AP News · 2d ago"
            }
          ].map((article, i) => (
            <Card key={i} className="border-border bg-card p-6">
              <Badge variant="outline" className="mb-3 border-border text-muted-foreground">{article.category}</Badge>
              <h3 className="font-display text-lg font-semibold text-foreground mb-3 leading-snug">{article.title}</h3>
              <ul className="space-y-2 mb-4">
                {article.bullets.map((b, j) => (
                  <li key={j} className="text-sm text-muted-foreground">{b}</li>
                ))}
              </ul>
              <div className="rounded-xl border border-border/50 bg-muted/20 p-3 mb-4">
                <p className="text-xs uppercase tracking-wider text-primary mb-1 font-medium">Key insight</p>
                <p className="text-sm text-foreground">{article.insight}</p>
              </div>
              <p className="text-xs text-muted-foreground">{article.source}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <Card className="border-border bg-card p-8 text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground mb-3">
            Stay ahead on MENA & Africa
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Get your daily briefing with focused MENA and African coverage. No noise, just the stories that matter.
          </p>
          <Button size="lg" asChild>
            <Link href="/RefinedFeed?country=tn">Explore the feed →</Link>
          </Button>
        </Card>
      </section>
    </main>
  );
}