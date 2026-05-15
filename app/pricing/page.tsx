"use client";

import { useState } from "react";

import { Check, Minus, Zap } from "lucide-react";

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
    cta: "Start reading",
    ctaHref: "/RefinedFeed",
    highlight: false,
    features: [
      { text: "15 topics", included: true },
      { text: "13 regions", included: true },
      { text: "50 articles/month", included: true },
      { text: "Fast summaries", included: true },
      { text: "RAG-grounded briefs", included: true },
      { text: "Infinite scroll", included: false },
      { text: "Advanced filters", included: false },
      { text: "API access", included: false },
      { text: "Priority support", included: false }
    ]
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For power readers",
    price: "$9",
    period: "per month",
    cta: "Go Pro",
    ctaHref: "#pricing",
    highlight: true,
    features: [
      { text: "15 topics", included: true },
      { text: "13 regions", included: true },
      { text: "Unlimited articles", included: true },
      { text: "All summary modes", included: true },
      { text: "RAG-grounded briefs", included: true },
      { text: "Infinite scroll", included: true },
      { text: "Advanced filters", included: true },
      { text: "API access", included: false },
      { text: "Priority support", included: false }
    ]
  },
  {
    id: "team",
    name: "Team",
    tagline: "For research teams",
    price: "$29",
    period: "per month",
    cta: "Start team",
    ctaHref: "#pricing",
    highlight: false,
    features: [
      { text: "15 topics", included: true },
      { text: "13 regions", included: true },
      { text: "Unlimited articles", included: true },
      { text: "All summary modes", included: true },
      { text: "RAG-grounded briefs", included: true },
      { text: "Infinite scroll", included: true },
      { text: "Advanced filters", included: true },
      { text: "5 seats, shared feeds", included: true },
      { text: "Priority support", included: true }
    ]
  },
  {
    id: "api",
    name: "API",
    tagline: "For builders",
    price: "$0.003",
    period: "per article",
    cta: "Get API key",
    ctaHref: "#pricing",
    highlight: false,
    features: [
      { text: "Full REST API", included: true },
      { text: "Webhooks + RSS", included: true },
      { text: "Custom embeddings", included: true },
      { text: "Dedicated endpoints", included: true },
      { text: "Rate limit: 10k/month", included: true },
      { text: "99.9% uptime SLA", included: true },
      { text: "Custom topic tuning", included: true },
      { text: "Volume discounts", included: true },
      { text: "Dedicated support", included: true }
    ]
  }
];

const faqs = [
  {
    q: "Can I switch plans anytime?",
    a: "Yes, upgrade or downgrade instantly. Downgrades take effect at the next billing cycle."
  },
  {
    q: "What's the difference between Pro and Team?",
    a: "Team gives you 5 seats with shared feeds and priority support. Pro is a single-seat plan with the same feature set as Team except shared access."
  },
  {
    q: "How does API pricing work?",
    a: "You pay per article distilled. Each call to the distillation endpoint counts as one article. Volume discounts kick in automatically at 1k, 5k, and 10k articles/month."
  },
  {
    q: "Do you offer annual billing?",
    a: "Yes — annual plans save 20%. Contact us at billing@distiller.attafii.app to switch."
  },
  {
    q: "Is there a free trial for Pro?",
    a: "Every new account starts with a 7-day Pro trial, no credit card required."
  }
];

function CheckRow({ text, included }: { text: string; included: boolean }) {
  return (
    <div className="flex items-center gap-3 py-2">
      {included ? (
        <Check className="h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} />
      ) : (
        <Minus className="h-4 w-4 shrink-0 text-muted-foreground/40" />
      )}
      <span className={`text-sm ${included ? "text-foreground" : "text-muted-foreground"}`}>{text}</span>
    </div>
  );
}

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-background">
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-primary text-primary-foreground shadow-sm">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M4 6h16M4 12h12M4 18h8" />
              </svg>
            </div>
            <div>
              <p className="font-display text-lg font-semibold tracking-tight">Distiller</p>
              <p className="text-xs text-muted-foreground">AI News Intelligence</p>
            </div>
          </a>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <a href="/RefinedFeed">Browse feed</a>
            </Button>
            <Button size="sm" asChild>
              <a href="#pricing">Get started</a>
            </Button>
          </div>
        </nav>
      </header>

      <div id="main-content">
        <section className="mx-auto max-w-5xl px-6 py-20 text-center">
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
                className={`relative border-border bg-card ${tier.highlight ? "shadow-elevated ring-2 ring-primary/20" : "shadow-soft"}`}
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
                  <Button
                    variant={tier.highlight ? "default" : "outline"}
                    className="w-full"
                    asChild
                  >
                    <a href={tier.ctaHref}>{tier.cta}</a>
                  </Button>
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
              <p className="text-sm leading-relaxed text-muted-foreground">
                Join thousands of researchers, developers, and curious readers who use Distiller to stay informed in seconds, not hours.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" asChild>
                  <a href="/RefinedFeed">Start reading free</a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="#pricing">View pricing</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      <footer className="border-t border-border/60 bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Distiller. Built with Next.js + NVIDIA Build.
          </p>
          <div className="flex items-center gap-4">
            <a href="/RefinedFeed" className="text-xs text-muted-foreground hover:text-foreground">Feed</a>
            <a href="#pricing" className="text-xs text-muted-foreground hover:text-foreground">Pricing</a>
            <a href="/feed.xml" className="text-xs text-muted-foreground hover:text-foreground">RSS</a>
          </div>
        </div>
      </footer>
    </main>
  );
}