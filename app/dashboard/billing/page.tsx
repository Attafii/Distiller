import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UpgradeButton, ManageBillingButton } from "@/components/dashboard/BillingActions";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Billing",
  description: "Manage your subscription"
};

export default async function BillingPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/login");
  }

  const userId = session.user.id;
  const db = getDb();

  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, userId)
  });

  const currentPlan = subscription?.plan ?? "free";
  const status = subscription?.status ?? "active";

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      period: "forever",
      description: "For curious readers",
      features: ["50 articles/month", "Basic topic filters", "RAG-grounded summaries", "Email support"],
      cta: "Current plan",
      highlighted: currentPlan === "free"
    },
    {
      id: "pro",
      name: "Pro",
      price: "$9",
      period: "per month",
      description: "For power readers",
      features: ["Unlimited articles", "All regions + topics", "Deep summary mode", "Priority support", "Bookmarks + history"],
      cta: currentPlan === "pro" ? "Current plan" : "Upgrade to Pro",
      highlighted: currentPlan === "pro"
    },
    {
      id: "team",
      name: "Team",
      price: "$29",
      period: "per month",
      description: "For research teams",
      features: ["5 seats", "Shared team feeds", "All Pro features", "Dedicated support", "Custom alerts"],
      cta: currentPlan === "team" ? "Current plan" : "Upgrade to Team",
      highlighted: currentPlan === "team"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Billing</h1>
        <p className="mt-2 text-sm text-muted-foreground">Manage your subscription and billing.</p>
      </div>

      {subscription && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-display text-lg">Subscription details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current plan</span>
              <span className="font-medium capitalize">{currentPlan}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium capitalize">{status}</span>
            </div>
            {subscription.currentPeriodEnd && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current period ends</span>
                <span className="font-medium">{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
              </div>
            )}
            {subscription.stripeCustomerId && currentPlan !== "free" && (
              <div className="mt-4">
                <ManageBillingButton label="Manage billing" variant="outline" size="sm" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
              {plan.highlighted ? (
                <Button variant="outline" className="w-full" disabled>
                  <span className="cursor-default">{plan.cta}</span>
                </Button>
              ) : plan.id === "free" ? (
                <Button variant="default" className="w-full" disabled>
                  {plan.cta}
                </Button>
              ) : (
                <UpgradeButton plan={plan.id as "pro" | "team"} label={plan.cta} />
              )}
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
          {subscription?.stripeCustomerId && currentPlan !== "free" ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Customer ID: {subscription.stripeCustomerId}</p>
              <ManageBillingButton label="Manage in Stripe" variant="outline" size="sm" />
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground">No payment method on file.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Upgrade to Pro or Team to add a payment method.
              </p>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link href="/pricing">View plans</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
