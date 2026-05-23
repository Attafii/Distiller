import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PricingSection } from "@/components/pricing/PricingSection";

const faqs = [
  {
    q: "Can I cancel anytime?",
    a: "Yes — cancel from your dashboard at any time. Downgrades take effect immediately, no refund needed for the current period."
  },
  {
    q: "What happens after the trial?",
    a: "Pro and Team start with a 7-day free trial. After that, you'll be charged monthly. Cancel before the trial ends to pay nothing."
  },
  {
    q: "What's the difference between Pro and Team?",
    a: "Pro is a single-seat plan with unlimited access. Team adds 5 shared seats, a team feed, and analytics — ideal for research groups."
  },
  {
    q: "How does API pricing work?",
    a: "You pay per article distilled. First 1,000 articles per month are free. Volume discounts apply at 1k, 5k, and 10k articles/month."
  },
  {
    q: "Do you offer annual billing?",
    a: "Yes — annual plans save 20%. Contact support@distiller.attafii.dev to switch."
  }
];

export const metadata: Metadata = {
  title: "Pricing · Distiller",
  description: "Simple, transparent pricing for Distiller — AI-powered news intelligence.",
  alternates: { canonical: "https://distiller.attafii.dev/pricing" },
  openGraph: {
    url: "https://distiller.attafii.dev/pricing",
    title: "Pricing · Distiller",
    description: "Simple, transparent pricing for Distiller — AI-powered news intelligence.",
    images: [{ url: "https://distiller.attafii.dev/api/og?title=Pricing&description=Simple+pricing", width: 1200, height: 630, alt: "Pricing" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing · Distiller",
    description: "Simple, transparent pricing for Distiller.",
    images: ["https://distiller.attafii.dev/api/og?title=Pricing"]
  }
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-background">
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <div id="main-content">
        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <Badge variant="outline" className="mb-6 border-border text-muted-foreground">
            Simple pricing
          </Badge>
          <h1 className="font-display text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
            News intelligence,<br />priced for everyone.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Start free. Upgrade when you need more. No hidden fees, no surprise billing.
          </p>
        </section>

        <section id="pricing" className="mx-auto max-w-6xl px-6 pb-24">
          <PricingSection />
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-24">
          <h2 className="mb-10 text-center font-display text-3xl font-semibold tracking-tight text-foreground">
            Frequently asked
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <Card key={i} className="border-border bg-card/80">
                <details className="group">
                  <summary className="flex w-full cursor-pointer items-center justify-between px-6 py-5 text-left list-none">
                    <span className="text-sm font-medium text-foreground">{faq.q}</span>
                    <span className="ml-4 shrink-0 text-muted-foreground transition group-open:rotate-180">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-6 pb-5">
                    <p className="text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                  </div>
                </details>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 pb-24 text-center">
          <Card className="border-border bg-card/80 shadow-soft">
            <CardContent className="space-y-6 px-8 py-12">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground">
                Ready to cut through the noise?
              </h2>
<p className="text-sm leading-relaxed text-muted-foreground max-w-lg mx-auto">
                Join researchers, developers, and curious readers who stay informed in seconds, not hours.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" asChild>
                  <Link href="/auth/signup">Start for free</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/RefinedFeed">Browse feed</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}