export const PLAN_LIMITS = {
  free: {
    articlesPerMonth: 50,
    topics: 2,
    regions: 2,
    label: "50 articles / month",
    bookmarks: false,
    deepSummary: false,
    rss: false,
    emailBriefing: false,
    priceMonthly: 0,
    priceAnnual: 0,
    trialDays: 0
  },
  pro: {
    articlesPerMonth: Infinity,
    topics: 15,
    regions: 15,
    label: "Unlimited",
    bookmarks: true,
    deepSummary: true,
    rss: true,
    emailBriefing: true,
    priceMonthly: 9,
    priceAnnual: 86.4,
    trialDays: 7
  },
  team: {
    articlesPerMonth: Infinity,
    topics: 15,
    regions: 15,
    label: "Unlimited",
    bookmarks: true,
    deepSummary: true,
    rss: true,
    emailBriefing: true,
    seats: 5,
    teamFeed: true,
    analytics: true,
    priceMonthly: 29,
    priceAnnual: 278.4,
    trialDays: 7
  },
  api: {
    articlesPerMonth: 1000,
    label: "1,000 articles included",
    apiAccess: true,
    pricePerArticle: 0.003
  }
} as const;

export const FREE_MONTHLY_ARTICLE_LIMIT = PLAN_LIMITS.free.articlesPerMonth;