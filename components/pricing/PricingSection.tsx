"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Minus, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const tiers = [
  {
    id: "free",
    name: "Free",
    tagline: "For curious readers",
    priceMonthly: 0,
    priceAnnual: 0,
    period: "forever",
    cta: "Get started",
    ctaHref: "/auth/signup",
    highlight: false,
    features: [
      { text: "50 articles/month", included: true },
      { text: "2 topics", included: true },
      { text: "2 regions", included: true },
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
    priceMonthly: 9,
    priceAnnual: 7.2,
    periodAnnual: "billed $86.40/yr",
    period: "per month",
    cta: "Start Pro trial",
    ctaHref: "/auth/signup",
    highlight: true,
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
    priceMonthly: 29,
    priceAnnual: 23.2,
    periodAnnual: "billed $278.40/yr",
    period: "per month",
    cta: "Start team trial",
    ctaHref: "/auth/signup",
    highlight: false,
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

function PricingCTA({ tier }: { tier: typeof tiers[number] }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (plan: "pro" | "team") => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan })
      });
      if (res.status === 401) {
        window.location.href = `/auth/signup?plan=${plan}`;
        return;
      }
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  };

  if (tier.id === "free") {
    return (
      <Button variant={tier.highlight ? "default" : "outline"} className="w-full" asChild>
        <Link href={tier.ctaHref}>{tier.cta}</Link>
      </Button>
    );
  }

  return (
    <Button
      variant={tier.highlight ? "default" : "outline"}
      className="w-full"
      disabled={loading}
      onClick={() => handleCheckout(tier.id as "pro" | "team")}
    >
      {loading ? "Redirecting..." : tier.cta}
    </Button>
  );
}

export function PricingSection() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  return (
    <div>
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card p-1">
          <button
            onClick={() => setBilling("monthly")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              billing === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("annual")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
              billing === "annual" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Annual
            <Badge variant="outline" className="text-xs px-1.5 py-0.5 border-green-500/30 text-green-600 dark:text-green-400 bg-green-500/5">
              Save 20%
            </Badge>
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {tiers.map((tier) => {
          const price = billing === "monthly" ? tier.priceMonthly : tier.priceAnnual;
          const period = billing === "annual" && tier.periodAnnual ? tier.periodAnnual : tier.period;
          return (
            <Card
              key={tier.id}
              className={`relative border-border bg-card ${tier.highlight ? "shadow-elevated ring-2 ring-primary/15" : "shadow-soft"}`}
            >
              {tier.highlight && billing === "monthly" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="default" className="px-3 py-1 text-xs font-medium">
                    <Zap className="mr-1 h-3 w-3" />
                    7-day free trial
                  </Badge>
                </div>
              )}
              {tier.highlight && billing === "annual" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="default" className="px-3 py-1 text-xs font-medium">
                    <Zap className="mr-1 h-3 w-3" />
                    7-day free trial · Save 20%
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-4">
                <p className="font-display text-2xl font-semibold">{tier.name}</p>
                <p className="text-sm text-muted-foreground">{tier.tagline}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-semibold text-foreground">
                    ${price}
                  </span>
                  <span className="text-sm text-muted-foreground">{period}</span>
                </div>
                {tier.id === "pro" && (
                  <p className="text-xs text-muted-foreground mt-1">Then $9/month. Cancel anytime.</p>
                )}
                {tier.id === "team" && (
                  <p className="text-xs text-muted-foreground mt-1">Then $29/month.</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <PricingCTA tier={tier} />
                <div className="border-t border-border pt-4">
                  {tier.features.map((f) => (
                    <CheckRow key={f.text} text={f.text} included={f.included} />
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}