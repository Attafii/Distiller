// Single source of truth for all user-visible public copy.
// Centralized user-facing copy. Server-safe (no "use client" needed);
// can be imported by both RSC pages and client components.
// Positioning: evidence-first personalized story intelligence.

export const COPY = {
  // Anonymous (guest) access limit — ADR-002: per-day, NOT per-month.
  guestLimit: "50 articles / day",

  scoreTooltip:
    "RAG retrieval confidence: how many source snippets grounded this summary. Does NOT measure source quality, factual accuracy, or publisher credibility.",

  landing: {
    heroBadge: "Evidence-first news intelligence for curious minds",
    heroHeadlineLine1: "The world's news,",
    heroHeadlineLine2: "three evidence-grounded bullets.",
    heroSubhead:
      "Stop skimming hundreds of articles. Distiller grounds every brief in retrieved source snippets via RAG, so you get verified, personalized story intelligence without the information overload.",
    heroPrimaryCta: "Start for free",
    heroSecondaryCta: "Browse the feed",
    heroTrialNote: "7-day Pro trial included · No credit card required",
    stats: [
      { value: "15", label: "Topics" },
      { value: "15", label: "Regions" },
      { value: "3", label: "Bullets/Article" },
      { value: "Free", label: "To start" }
    ],
    features: [
      {
        title: "Evidence-first grounding",
        description:
          "Every brief pulls directly from retrieved source snippets via RAG. No guesswork, no fabrication — just the facts."
      },
      {
        title: "Three grounded bullets",
        description:
          "Compact briefs with a key insight and a conclusion — each bullet traced to source evidence. Scan the world's news in minutes, not hours."
      },
      {
        title: "15 Topics, 15 Regions",
        description:
          "From AI to finance to Tunisia — filter by what matters to you and get exactly your slice of the world."
      },
      {
        title: "Live RSS Feed",
        description:
          "Subscribe via RSS (Pro). Stay updated in your favorite reader app — Feedly, NetNewsWire, or any RSS client."
      }
    ],
    sampleSummary: {
      badge: "Sample summary",
      headline: "Large Language Models Show Emergent Reasoning Capabilities at Scale",
      bullets: [
        "Models above 70B parameters demonstrate chain-of-thought reasoning without explicit prompting",
        "Scaling laws predict 2x improvement on complex tasks with 4x compute budget increase",
        "Researchers confirm capability emergence is consistent across different architecture families"
      ],
      insight:
        "The study validates that reasoning emerges predictably at scale, suggesting current frontier models are still on the steep part of the learning curve.",
      source: "arXiv · 2h ago",
      keyInsightLabel: "Key insight",
      checkmarks: [
        "3 concise bullets",
        "Grounded in source evidence",
        "Key insight + conclusion",
        "Source attribution"
      ]
    },
    freeVsPro: {
      title: "Free vs Pro",
      free: {
        name: "Free",
        features: [
          { text: "50 articles / day", included: true },
          { text: "2 topics", included: true },
          { text: "2 regions", included: true },
          { text: "Basic filters", included: true },
          { text: "Deep summaries", included: false },
          { text: "Bookmarks", included: false },
          { text: "Daily email briefing", included: false },
          { text: "RSS feed", included: false },
          { text: "Shareable briefs", included: false }
        ]
      },
      pro: {
        name: "Pro",
        popularBadge: "Most popular",
        cta: "Start 7-day free trial",
        features: [
          { text: "Unlimited articles", included: true },
          { text: "All 15 topics", included: true },
          { text: "All 15 regions", included: true },
          { text: "Advanced filters + Deep mode", included: true },
          { text: "Bookmarks", included: true },
          { text: "Daily email briefing", included: true },
          { text: "RSS feed", included: true },
          { text: "Shareable briefs", included: true }
        ]
      }
    },
    deepSummary: {
      title: "Deep Summary Mode",
      description:
        "Pro readers get extended briefs — more context, more nuance, same zero fluff. Switch modes per article or set it as your default."
    },
    freeToStartBadge: "100% free to start",
    finalCtaTitle: "No credit card. No catch.",
    finalCtaSubhead:
      "Begin with 50 articles per day on the free plan. Upgrade to Pro for unlimited access, advanced filters, and bookmarking. Cancel anytime.",
    finalCtaPrimary: "Create free account",
    finalCtaSecondary: "View all plans",
    topicsTitle: "Topics we cover",
    readyTitle: "Ready to cut through the noise?",
    readySubhead:
      "Join researchers, developers, and curious readers who stay informed in seconds, not hours.",
    readyCtaPrimary: "Get started free",
    readyCtaSecondary: "Browse feed"
  },

  feed: {
    logoSubtitle: "Refined feed",
    heroBadge: "Verified + distilled",
    heroHeadline: "Refine the global feed into evidence-grounded signals you can scan in seconds.",
    heroSubhead:
      "Distiller fetches stories from our API-backed pipeline, grounds them with embeddings, and uses RAG to render exactly three concise bullets per article.",
    pipelineBadge: "NewsAPI + NVIDIA Build",
    filterHelp:
      "Use the topic chips to widen or narrow the story set, the region chips to focus on Tunisia, China, Russia, or another market, and the mode chips to switch between faster and deeper summaries.",
    topicFilterLabel: "Topics",
    regionFilterLabel: "Region",
    dateFilterLabel: "Date range",
    priorityFilterLabel: "Priority",
    priorityNote: "Red dot means important or breaking news.",
    searchLabel: "Search news topics",
    searchPlaceholder: "Search topics, regions, or headlines",
    searchButton: "Search",
    clearButton: "Clear",
    refreshButton: "Refresh",
    guestFreeBadge: `Free: ${"50 articles / day"}`,
    guestGlobalOnly: "Global only",
    errorTitle: "Unable to load the feed",
    emptyTitle: "No articles yet",
    emptyFilteredTitle: "No stories match this filter",
    emptyDescription:
      "Try another topic, switch the region, or change the summary mode to load a different briefing style.",
    guestSignInPrompt: "Sign in to unlock your full personalized feed.",
    guestPreviewNote: "These are sample previews to show you how Distiller works.",
    guestLimitTitle: "You have reached your free daily limit",
    guestLimitSubhead:
      "Create a free account to get 50 free articles every day, unlimited bookmarks, personalized alerts, and more.",
    guestCtaPrimary: "Create free account",
    guestCtaSecondary: "View pricing",
    loadingMore: "Loading more stories",
    endOfFeed: "You reached the end of the current feed"
  },

  about: {
    title: "About Distiller",
    tagline: "Built because staying informed shouldn't cost you 2 hours a day.",
    paragraphs: [
      "Distiller started as a personal frustration. Every morning meant the same ritual: opening fifteen browser tabs, skimming headlines, losing 90 minutes to context-switching before getting to actual work. The world produces more news than any human can reasonably process — and most of it is noise.",
      "The idea is simple: what if an AI could read everything, distill it down to exactly what matters, and present it in a format you can scan in 60 seconds? Three bullets. One insight. A clear conclusion. No padding, no speculation, no filler.",
      "Every brief is evidence-first: grounded in the original source text using RAG and NVIDIA embeddings, so you always know what's real and what the model inferred. Citations aren't decorative — they're the foundation.",
      "The product is still young. We cover 15 topics across 15 regions, with a free tier that gives you 50 articles per day. The goal isn't to replace your news diet — it's to make sure the time you spend on it is actually worth it."
    ],
    contactTitle: "Questions, feedback, or partnership inquiries?",
    browseCta: "Browse the feed",
    pricingCta: "View pricing"
  },

  terms: {
    title: "Terms of Service",
    effectiveDate: "Effective date: June 1, 2026",
    disclaimer:
      "Distiller does not reproduce, host, or extract the full text of third-party articles. We process only the NewsAPI-provided payload — the article title, description, and a truncated content excerpt — to generate brief, grounded summaries. Always verify important claims against the original publisher.",
    sections: [
      {
        heading: "1. Acceptance of Terms",
        body: 'By accessing or using Distiller ("the Service"), you agree to be bound by these Terms of Service ("ToS"). If you do not agree to these terms, do not use the Service.'
      },
      {
        heading: "2. Service Description",
        body: "Distiller is an AI-powered news intelligence platform that aggregates and summarizes news content in concise brief formats. The Service uses Retrieval-Augmented Generation (RAG) and large language models to generate summaries from NewsAPI-provided article payloads (title, description, and truncated content). Distiller does not publish original news content."
      },
      {
        heading: "3. User Accounts and Eligibility",
        body: "You must be at least 13 years old to create an account. You agree to provide accurate information and keep your credentials secure. You are responsible for all activity under your account."
      },
      {
        heading: "4. Subscription Plans and Billing",
        body: "Distiller offers Free, Pro, Team, and API plans. Paid plans are billed monthly or annually as selected. By subscribing to a paid plan you authorize us to charge your payment method on a recurring basis until you cancel. All fees are non-refundable except where required by law. Pro and Team plans include a 7-day free trial. Cancel before the trial ends and you will not be charged. Cancellations take effect immediately; downgrades to the Free plan take effect at the end of your current billing period."
      },
      {
        heading: "5. Acceptable Use",
        body: "You agree not to: (a) scrape, resell, or redistribute the AI-generated summaries or any content from the Service; (b) use automated bots or crawlers without prior written consent; (c) attempt to extract or reproduce full source article text; (d) use the Service in any way that violates applicable law."
      },
      {
        heading: "6. AI-Generated Content Disclaimer",
        body: "Distiller uses AI to summarize third-party articles. These summaries may contain errors, omissions, or inaccuracies. Summaries are grounded in source text using RAG but the model may infer information not present in the original source. Always verify with the original source before making decisions based on Distiller content."
      },
      {
        heading: "7. Intellectual Property",
        body: "You retain ownership of your user data. Distiller and its sources retain their respective intellectual property rights. The underlying news articles belong to their respective publishers. Distiller trademarks, logos, and the Service design are property of Distiller."
      },
      {
        heading: "8. Limitation of Liability",
        body: 'TO THE MAXIMUM EXTENT PERMITTED BY LAW, DISTILLER IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL LIABILITY FOR DIRECT, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE SERVICE.'
      },
      {
        heading: "9. Governing Law and GDPR Compliance",
        body: "These Terms are governed by the laws of Tunisia. For users in the European Union or European Economic Area, we comply with the General Data Protection Regulation (GDPR). You have the right to access, correct, delete, or port your personal data. Contact us at privacy@distiller.attafii.dev."
      },
      {
        heading: "10. Changes to Terms",
        body: "We may update these Terms from time to time. We will notify you of material changes via email or in-app notification. Continued use after changes constitutes acceptance of the updated Terms."
      }
    ]
  },

  privacy: {
    title: "Privacy Policy",
    lastUpdated: "Last updated: June 1, 2026",
    aiProcessing:
      "To generate summaries, only the NewsAPI-provided article payload is processed: the article title, description, and a truncated content excerpt. Source material is processed in memory only, is not stored beyond the session, and full article text is never fetched, scraped, or reproduced.",
    sections: [
      {
        heading: "1. What We Collect",
        body: "We collect: your email address and name (from account creation), your topic and region preferences (from onboarding and settings), your reading history and bookmarks (to power your dashboard), and basic usage data (article views, features used) to improve the Service. We do not sell your personal data to advertisers or third parties. We do not use advertising tracking cookies."
      },
      {
        heading: "2. How We Use Your Data",
        body: "We use your data to: deliver your personalized news briefing, send optional daily email digests if you opt in, power your bookmarks and reading history, improve our AI summarization quality, and communicate account-related notices."
      },
      {
        heading: "3. AI Processing",
        body: "Only the NewsAPI-provided article payload — the title, description, and truncated content excerpt — is processed by our NVIDIA-powered AI pipeline to generate grounded summaries. Full article text is never fetched or processed. Summaries are generated on-demand and are not stored persistently."
      },
      {
        heading: "4. Data Retention",
        body: "Your account data is deleted within 30 days of account deletion upon request. Reading history and bookmarks are deleted when you delete your account. Usage analytics are retained in anonymized, aggregated form indefinitely."
      },
      {
        heading: "5. Your Rights (GDPR & CCPA)",
        body: "GDPR (EU/EEA users): You have the right to access, rectification, erasure, portability, and restriction of processing of your personal data. Contact us at privacy@distiller.attafii.dev. CCPA (California residents): You may opt out of the sale of personal information. We do not sell personal information. You may request disclosure of data we hold about you."
      },
      {
        heading: "6. Cookies",
        body: "We use only essential cookies for session management (Better Auth). No advertising or tracking cookies are used. Optional analytics (Vercel Analytics) only loads with your cookie consent."
      },
      {
        heading: "7. Third-Party Services",
        body: "We use: Neon (PostgreSQL database), Vercel (hosting and analytics), Stripe (payments), NewsAPI (news data), NVIDIA Build (AI summarization). Each has their own privacy policy."
      },
      {
        heading: "8. Children's Privacy",
        body: "Distiller is not intended for users under 13. We do not knowingly collect data from minors."
      },
      {
        heading: "9. Contact",
        body: "Privacy inquiries: privacy@distiller.attafii.dev"
      }
    ]
  },

  mena: {
    badge: "MENA & Africa Edition",
    headlineLine1: "Your slice of the world's",
    headlineLine2: "most dynamic region.",
    subhead:
      "Coverage of Tunisia, Egypt, Nigeria, Kenya, Morocco, Saudi Arabia, UAE, and across the continent — evidence-grounded, distilled in 3 bullets per story.",
    browseTunisiaCta: "Browse Tunisia",
    browseAllCta: "Browse all regions",
    featuredTitle: "Featured from the region",
    keyInsightLabel: "Key insight",
    ctaTitle: "Stay ahead on MENA & Africa",
    ctaSubhead:
      "Get your daily briefing with focused MENA and African coverage. No noise, just the evidence-first stories that matter.",
    exploreCta: "Explore the feed →",
    sampleArticles: [
      {
        category: "World · MENA",
        title: "Tunisia Signs €400M Green Energy Partnership with the EU",
        bullets: [
          "Solar installation across three southern governorates",
          "12,000 direct jobs expected",
          "Knowledge transfer requires 60% local engineering"
        ],
        insight: "One of the largest EU-Tunisia energy deals to date.",
        source: "Reuters Africa · 6h ago"
      },
      {
        category: "Business · Africa",
        title: "Africa's Startup Funding Hits $4.2B in Q1 2026",
        bullets: [
          "Nigeria, Kenya, Egypt account for 68% of funding",
          "Fintech dominates at 41% of deals",
          "Median deal size grew to $2.8M"
        ],
        insight: "African startup capital is maturing — larger rounds signal conviction.",
        source: "TechCabal · 14h ago"
      },
      {
        category: "Technology · MENA",
        title: "Saudi Arabia Launches $10B AI Infrastructure Fund",
        bullets: [
          "Fund managed by Public Investment Fund",
          "Targets data centers across the GCC",
          "Open to international tech partnerships"
        ],
        insight: "The kingdom is positioning itself as the AI hub of the Middle East.",
        source: "Financial Times · 1d ago"
      },
      {
        category: "Health · Africa",
        title: "Nigeria Deploys WHO-Approved Malaria Vaccine Nationwide",
        bullets: [
          "RTS,S vaccine reaches 3.2M children in pilot program",
          "37% reduction in severe cases observed",
          "WHO prequalification enables bulk procurement"
        ],
        insight: "A milestone for child health in Africa's most populous nation.",
        source: "AP News · 2d ago"
      }
    ]
  },

  brief: {
    defaultTitle: "Article Brief",
    logoSubtitle: "News Intelligence",
    backToFeed: "← Back to feed",
    badge: "AI Brief",
    keyPointsLabel: "3 Key Points",
    keyInsightLabel: "Key Insight",
    readOriginal: "Read original article",
    shareOnX: "Share on X",
    exploreMore: "Explore more →",
    footerPrefix: "Briefed by",
    footerSuffix: "— evidence-first personalized story intelligence"
  },

  pricing: {
    badge: "Simple pricing",
    headlineLine1: "News intelligence,",
    headlineLine2: "priced for everyone.",
    subhead:
      "Start free with 50 articles a day. Upgrade when you need more. No hidden fees, no surprise billing.",
    faqsTitle: "Frequently asked",
    faqs: [
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
    ],
    readyTitle: "Ready to cut through the noise?",
    readySubhead:
      "Join researchers, developers, and curious readers who stay informed in seconds, not hours.",
    readyCtaPrimary: "Start for free",
    readyCtaSecondary: "Browse feed"
  },

  dashboard: {
    title: "Overview",
    subtitle: "Your personal evidence-first news intelligence at a glance."
  },

  metadata: {
    rootTitle: "Distiller — Evidence-First News Intelligence",
    rootDescription:
      "Evidence-first personalized story intelligence. Grounded three-bullet news briefings distilled from the original sources via RAG.",
    feedTitle: "Refined Feed · Distiller",
    feedDescription:
      "Evidence-first personalized feed. Stories grounded via RAG retrieval and distilled into three concise bullets per article.",
    aboutTitle: "About · Distiller",
    aboutDescription:
      "About Distiller — evidence-first personalized story intelligence, built because staying informed shouldn't cost you 2 hours a day.",
    termsTitle: "Terms of Service · Distiller",
    termsDescription:
      "Terms of Service for Distiller — evidence-first AI news intelligence platform.",
    privacyTitle: "Privacy Policy · Distiller",
    privacyDescription: "Privacy Policy for Distiller — how we collect, use, and protect your data.",
    menaTitle: "MENA & Africa · Distiller",
    menaDescription:
      "Evidence-first coverage of Tunisia, Egypt, Nigeria, Kenya, Morocco, Saudi Arabia, UAE, and across the continent, distilled in 3 grounded bullets.",
    pricingTitle: "Pricing · Distiller",
    pricingDescription:
      "Evidence-first news intelligence, priced for everyone. Start free with 50 articles a day; upgrade when you need more.",
    dashboardTitle: "Dashboard",
    dashboardDescription: "Your evidence-first personalized news intelligence dashboard overview."
  }
} as const;
