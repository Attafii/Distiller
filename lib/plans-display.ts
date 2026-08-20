/**
 * Client-safe plan display data for UI components.
 *
 * This file does NOT import from lib/plans.ts (which is server-only).
 * The data here mirrors the UI-renderable subset of PLAN_LIMITS.
 * Update both files when entitlements change.
 */

export type PlanDisplay = {
  id: string;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceAnnual: number;
  trialDays: number;
  cta: string;
  ctaHref: string;
  highlight?: string;
  features: string[];
  publiclyVisible: boolean;
};

export const PLAN_LIMITS_DISPLAY: PlanDisplay[] = [
  {
    id: "free",
    name: "Free",
    tagline: "For curious readers",
    priceMonthly: 0,
    priceAnnual: 0,
    trialDays: 0,
    cta: "Get started",
    ctaHref: "/auth/signup",
    features: [
      "50 articles/month",
      "2 topics",
      "2 regions",
      "Basic filters"
    ],
    publiclyVisible: true
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For power readers",
    priceMonthly: 9,
    priceAnnual: 86.4,
    trialDays: 7,
    cta: "Start Pro trial",
    ctaHref: "/auth/signup",
    highlight: "Most popular",
    features: [
      "Unlimited articles",
      "All 15 topics",
      "All 15 regions",
      "Deep summary mode",
      "Bookmarks",
      "Reading history",
      "Advanced filters",
      "Priority support"
    ],
    publiclyVisible: true
  },
  {
    id: "team",
    name: "Team",
    tagline: "For research teams",
    priceMonthly: 29,
    priceAnnual: 278.4,
    trialDays: 7,
    cta: "Start team trial",
    ctaHref: "/auth/signup",
    features: [
      "Everything in Pro",
      "5 team seats",
      "Shared team feed",
      "Custom alerts",
      "Team analytics",
      "Dedicated support",
      "Export to CSV/PDF",
      "Priority onboarding"
    ],
    publiclyVisible: true
  }
];