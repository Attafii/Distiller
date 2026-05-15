import type { Metadata } from "next";
import Link from "next/link";
import { CreditCard, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Billing",
  description: "Manage your subscription"
};

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For curious readers",
    features: ["50 articles/month", "Basic topic filters", "RAG-grounded summaries", "Email support"],
    cta: "Current plan",
    highlighted: true
  },
  {
    id: "pro",
    name: "Pro",
    price: "$9",
    period: "per month",
    description: "For power readers",
    features: ["Unlimited articles", "All regions + topics", "Deep summary mode", "Priority support", "Bookmarks + history"],
    cta: "Upgrade to Pro",
    highlighted: false
  },
  {
    id: "team",
    name: "Team",
    price: "$29",
    period: "per month",
    description: "For research teams",
    features: ["5 seats", "Shared team feeds", "All Pro features", "Dedicated support", "Custom alerts"],
    cta: "Upgrade to Team",
    highlighted: false
  }
];

export default function BillingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Billing</h1>
        <p className="mt-2 text-sm text-muted-foreground">Manage your subscription and billing.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`border-border bg-card ${plan.highlighted ? "ring-2 ring-primary/20 shadow-soft" : ""}`}
          >
            <CardHeader>
              <CardTitle className="font-display text-xl">{plan.name}</CardTitle>
              <CardDescription className="text-sm">{plan.description}</CardDescription>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <Check className="h-4 w-4 text-primary" strokeWidth={2.5} />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.highlighted ? "outline" : "default"}
                className="w-full"
                asChild={!plan.highlighted}
              >
                {plan.highlighted ? (
                  <span className="cursor-default">{plan.cta}</span>
                ) : (
                  <Link href="/pricing">{plan.cta}</Link>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-display text-lg">Payment method</CardTitle>
          <CardDescription className="text-sm">Update your billing information</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No payment method on file.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Upgrade to Pro or Team to add a payment method.
          </p>
          <Button variant="outline" size="sm" className="mt-4" asChild>
            <Link href="/pricing">View plans</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}