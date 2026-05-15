"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Minus, Zap, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const tiers = [
  {
    id: "free",
    name: "Free",
    tagline: "For curious readers",
    price: "$0",
    period: "forever",
    cta: "Get started",
    ctaHref: "/auth/signup",
    highlight: false,
    monthly: false,
    features: [
      { text: "50 articles/month", included: true },
      { text: "15 topics", included: true },
      { text: "15 regions", included: true },
      { text: "Basic filters", included: true },
      { text: "Bookmarks", included: false },
      { text: "Reading history", included: false },
      { text: "Advanced filters", included: false },
      { text: "Unlimited articles", included: false }
    ]
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For power readers",
    price: "$9",
    period: "per month",
    cta: "Start Pro trial",
    ctaHref: "#checkout",
    highlight: true,
    monthly: true,
    features: [
      { text: "Unlimited articles", included: true },
      { text: "All 15 topics", included: true },
      { text: "All 15 regions", included: true },
      { text: "Deep summary mode", included: true },
      { text: "Bookmarks", included: true },
      { text: "Reading history", included: true },
      { text: "Advanced filters", included: true },
      { text: "Priority support", included: true }
    ]
  },
  {
    id: "team",
    name: "Team",
    tagline: "For research teams",
    price: "$29",
    period: "per month",
    cta: "Start team trial",
    ctaHref: "#checkout",
    highlight: false,
    monthly: true,
    features: [
      { text: "Everything in Pro", included: true },
      { text: "5 team seats", included: true },
      { text: "Shared team feed", included: true },
      { text: "Custom alerts", included: true },
      { text: "Team analytics", included: true },
      { text: "Dedicated support", included: true },
      { text: "Export to CSV/PDF", included: true },
      { text: "Priority onboarding", included: true }
    ]
  },
  {
    id: "api",
    name: "API",
    tagline: "For developers",
    price: "$0.003",
    period: "per article",
    cta: "Get API key",
    ctaHref: "/auth/signup?plan=api",
    highlight: false,
    monthly: false,
    features: [
      { text: "REST API access", included: true },
      { text: "Webhooks", included: true },
      { text: "RSS integration", included: true },
      { text: "Custom topic tuning", included: true },
      { text: "1k articles/month included", included: true },
      { text: "Volume discounts", included: true },
      { text: "99.9% uptime SLA", included: true },
      { text: "Dedicated support", included: true }
    ]
  }
];

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
    a: "Yes — annual plans save 20%. Contact billing@distiller.attafii.app to switch."
  }
];

function CheckRow({ text, included }: { text: string; included: boolean }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      {included ? (
        <Check className="h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} />
      ) : (
        <Minus className="h-4 w-4 shrink-0 text-muted-foreground/30" />
      )}
      <span className={`text-sm ${included ? "text-foreground" : "text-muted-foreground/60"}`}>{text}</span>
    </div>
  );
}

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleCheckout = async (planId: string) => {
    if (planId === "free" || planId === "api") return;

    setLoadingPlan(planId);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId })
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        window.location.href = "/auth/signup";
      }
    } catch {
      window.location.href = "/auth/signup";
    } finally {
      setLoadingPlan(null);
    }
  };

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
          <div className="grid gap-6 lg:grid-cols-2">
            {tiers.map((tier) => (
              <Card
                key={tier.id}
                id={tier.id === "pro" ? "checkout" : undefined}
                className={`relative border-border bg-card ${tier.highlight ? "shadow-elevated ring-2 ring-primary/15" : "shadow-soft"}`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="default" className="px-3 py-1 text-xs font-medium">
                      <Zap className="mr-1 h-3 w-3" />
                      Most popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <p className="font-display text-2xl font-semibold">{tier.name}</p>
                  <p className="text-sm text-muted-foreground">{tier.tagline}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="font-display text-4xl font-semibold text-foreground">{tier.price}</span>
                    <span className="text-sm text-muted-foreground">{tier.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tier.id === "free" || tier.id === "api" ? (
                    <Button
                      variant={tier.highlight ? "default" : "outline"}
                      className="w-full"
                      asChild
                    >
                      <Link href={tier.ctaHref}>{tier.cta}</Link>
                    </Button>
                  ) : (
                    <Button
                      variant={tier.highlight ? "default" : "outline"}
                      className="w-full"
                      onClick={() => handleCheckout(tier.id)}
                      disabled={loadingPlan !== null}
                    >
                      {loadingPlan === tier.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Redirecting...
                        </>
                      ) : (
                        tier.cta
                      )}
                    </Button>
                  )}
                  <div className="border-t border-border pt-4">
                    {tier.features.map((f) => (
                      <CheckRow key={f.text} text={f.text} included={f.included} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-24">
          <h2 className="mb-10 text-center font-display text-3xl font-semibold tracking-tight text-foreground">
            Frequently asked
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <Card key={i} className="border-border bg-card/80">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left"
                  aria-expanded={openFaq === i}
                >
                  <span className="text-sm font-medium text-foreground">{faq.q}</span>
                  <span className={`ml-4 shrink-0 text-muted-foreground transition ${openFaq === i ? "rotate-180" : ""}`}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5">
                    <p className="text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                  </div>
                )}
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
                Join thousands of researchers, developers, and curious readers who use Distiller
                to stay informed in seconds, not hours.
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