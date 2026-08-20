import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://distiller.attafii.dev";

export const metadata: Metadata = {
  title: "About · Distiller",
  description: "About Distiller — built because staying informed shouldn't cost you 2 hours a day.",
  alternates: { canonical: `${siteUrl}/about` },
  openGraph: {
    url: `${siteUrl}/about`,
    title: "About · Distiller",
    description: "About Distiller — built because staying informed shouldn't cost you 2 hours a day.",
    images: [{ url: `${siteUrl}/api/og?title=About`, width: 1200, height: 630, alt: "About" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "About · Distiller",
    images: [`${siteUrl}/api/og?title=About`]
  }
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl 2xl:max-w-3xl px-4 md:px-6 lg:px-8 py-20">
        <div className="mb-12">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground mb-4">
            About Distiller
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Built because staying informed shouldn&apos;t cost you 2 hours a day.
          </p>
        </div>

        <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <p>
            Distiller started as a personal frustration. Every morning meant the same ritual: opening
            fifteen browser tabs, skimming headlines, losing 90 minutes to context-switching before
            getting to actual work. The world produces more news than any human can reasonably process —
            and most of it is noise.
          </p>
          <p>
            The idea is simple: what if an AI could read everything, distill it down to exactly
            what matters, and present it in a format you can scan in 60 seconds? Three bullets. One
            insight. A clear conclusion. No padding, no speculation, no filler.
          </p>
          <p>
            Every brief is grounded in the original source text using RAG and NVIDIA embeddings,
            so you always know what&apos;s real and what the model inferred. Citations aren&apos;t
            decorative — they&apos;re the foundation.
          </p>
          <p>
            The product is still young. We cover 15 topics across 15 regions, with a free tier
            that gives you 50 articles per month. The goal isn&apos;t to replace your news diet —
            it&apos;s to make sure the time you spend on it is actually worth it.
          </p>
        </div>

        <div className="mt-10 pt-8 border-t border-border">
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-4">
                Questions, feedback, or partnership inquiries? Reach us at{" "}
                <a href="mailto:hello@distiller.attafii.dev" className="text-primary hover:underline">hello@distiller.attafii.dev</a>
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/RefinedFeed">
                    Browse the feed <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/pricing">View pricing</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}