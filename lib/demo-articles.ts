import type { DistilledArticle } from "@/types/news";

const now = new Date();
const h = (n: number) => new Date(now.getTime() - n * 60 * 60 * 1000).toISOString();

export const DEMO_ARTICLES: DistilledArticle[] = [
  {
    id: "demo-1",
    title: "Fed Holds Rates Steady Amid Mixed Inflation Signals",
    description: "The Federal Reserve kept its benchmark rate unchanged, signaling caution over inflation trajectory.",
    content: null,
    url: "#",
    imageUrl: null,
    publishedAt: h(2),
    source: { id: null, name: "Reuters" },
    category: "finance",
    priority: "normal",
    summary: {
      bullets: [
        "Federal Reserve kept benchmark rate at 5.25–5.5% for the third consecutive meeting",
        "Chair Powell cited persistent services inflation as the primary concern blocking cuts",
        "Markets are now pricing in one rate cut before year-end, down from three expected in January"
      ],
      insight: "The Fed is playing it safe — expect rates to stay elevated through at least Q3 2026.",
      conclusion: "Bond markets are pricing in a single cut before year-end, dependent on upcoming CPI data.",
      model: "nvidia/llama-3.3-nemotron-super-49b-v1",
      confidence: 0.87,
      retrievedContext: []
    },
    likeCount: 0,
    likedByViewer: false,
    bookmarked: false
  },
  {
    id: "demo-2",
    title: "OpenAI Releases GPT-5 with Native Multimodal Reasoning",
    description: "The latest GPT model achieves state-of-the-art performance across text, image, and audio benchmarks.",
    content: null,
    url: "#",
    imageUrl: null,
    publishedAt: h(4),
    source: { id: null, name: "The Verge" },
    category: "ai",
    priority: "important",
    summary: {
      bullets: [
        "GPT-5 achieves 91% on MMLU benchmark, a 14-point jump from GPT-4o",
        "The model handles image, audio, and document reasoning in a single unified pass",
        "API pricing set at $15 per million input tokens — 40% higher than GPT-4o"
      ],
      insight: "GPT-5 is a step change in reasoning quality, but the price hike may push developers toward open alternatives.",
      conclusion: "OpenAI is clearly targeting enterprise customers with this release.",
      model: "nvidia/llama-3.1-nemotron-ultra-253b-v1",
      confidence: 0.91,
      retrievedContext: []
    },
    likeCount: 0,
    likedByViewer: false,
    bookmarked: false
  },
  {
    id: "demo-3",
    title: "Tunisia Signs €400M Green Energy Partnership with the EU",
    description: "A landmark agreement to accelerate Tunisia's renewable energy transition.",
    content: null,
    url: "#",
    imageUrl: null,
    publishedAt: h(6),
    source: { id: null, name: "Reuters Africa" },
    category: "world",
    priority: "normal",
    summary: {
      bullets: [
        "Agreement covers large-scale solar installation across three southern governorates",
        "The deal is expected to create 12,000 direct jobs and reduce gas import dependency",
        "Knowledge transfer provisions require 60% of engineering work to involve local talent"
      ],
      insight: "This is one of the largest EU-Tunisia energy deals to date, signalling serious intent on the hydrogen corridor.",
      conclusion: "If executed well, this could serve as a template for similar North African renewable partnerships.",
      model: "nvidia/llama-3.3-nemotron-super-49b-v1",
      confidence: 0.84,
      retrievedContext: []
    },
    likeCount: 0,
    likedByViewer: false,
    bookmarked: false
  },
  {
    id: "demo-4",
    title: "Anthropic Raises $3.5B at $61B Valuation",
    description: "The AI safety company closes a massive Series E to compete with OpenAI.",
    content: null,
    url: "#",
    imageUrl: null,
    publishedAt: h(8),
    source: { id: null, name: "Bloomberg" },
    category: "tech",
    priority: "important",
    summary: {
      bullets: [
        "Series E led by Google with participation from Spark Capital and Salesforce Ventures",
        "Funds earmarked for compute infrastructure and safety research expansion",
        "Valuation represents a 4x increase from the 2023 Series C"
      ],
      insight: "AI infrastructure spending is accelerating faster than revenue — the question is whether safety investment scales with it.",
      conclusion: "This round signals that safety-focused AI is now a mainstream investment category.",
      model: "nvidia/llama-3.3-nemotron-super-49b-v1",
      confidence: 0.88,
      retrievedContext: []
    },
    likeCount: 0,
    likedByViewer: false,
    bookmarked: false
  },
  {
    id: "demo-5",
    title: "WHO Declares End to Mpox Global Health Emergency",
    description: "The WHO lifts the PHEIC declaration after case counts dropped 94% from the 2022 peak.",
    content: null,
    url: "#",
    imageUrl: null,
    publishedAt: h(10),
    source: { id: null, name: "AP News" },
    category: "health",
    priority: "normal",
    summary: {
      bullets: [
        "Emergency status lifted after case counts dropped 94% from the 2022 peak",
        "Africa remains the region with highest ongoing transmission risk",
        "WHO will continue monitoring through a new post-emergency framework"
      ],
      insight: "The emergency is over but endemic risk in Central Africa persists — vaccination coverage remains critically low.",
      conclusion: "Global health coordination worked, but equitable vaccine distribution still has a long way to go.",
      model: "nvidia/llama-3.3-nemotron-super-49b-v1",
      confidence: 0.95,
      retrievedContext: []
    },
    likeCount: 0,
    likedByViewer: false,
    bookmarked: false
  },
  {
    id: "demo-6",
    title: "China Launches First Crewed Mission to Lunar South Pole",
    description: "Chang'e 8 mission carries a crew of three with a planned 14-day surface stay.",
    content: null,
    url: "#",
    imageUrl: null,
    publishedAt: h(12),
    source: { id: null, name: "Space.com" },
    category: "science",
    priority: "important",
    summary: {
      bullets: [
        "Chang'e 8 mission carries a crew of three with a planned 14-day surface stay",
        "Primary objective is ice extraction testing at the Shackleton Crater rim",
        "Mission success would make China the second nation to land humans on the Moon"
      ],
      insight: "If successful, this establishes China as a genuine peer in deep space — not just LEO — within this decade.",
      conclusion: "The geopolitical implications of a permanent Chinese lunar presence are significant.",
      model: "nvidia/llama-3.3-nemotron-super-49b-v1",
      confidence: 0.82,
      retrievedContext: []
    },
    likeCount: 0,
    likedByViewer: false,
    bookmarked: false
  },
  {
    id: "demo-7",
    title: "Africa's Startup Funding Hits $4.2B in Q1 2026",
    description: "Nigeria, Kenya, and Egypt accounted for 68% of total funding volume in Q1.",
    content: null,
    url: "#",
    imageUrl: null,
    publishedAt: h(14),
    source: { id: null, name: "TechCabal" },
    category: "business",
    priority: "normal",
    summary: {
      bullets: [
        "Nigeria, Kenya, and Egypt accounted for 68% of total funding volume",
        "Fintech remains dominant at 41% of deals, followed by healthtech at 19%",
        "Median deal size grew to $2.8M — up from $1.1M in Q1 2024"
      ],
      insight: "African startup capital is maturing — larger rounds signal investors are moving from bets to conviction.",
      conclusion: "The next wave of African tech giants is being built right now.",
      model: "nvidia/llama-3.3-nemotron-super-49b-v1",
      confidence: 0.76,
      retrievedContext: []
    },
    likeCount: 0,
    likedByViewer: false,
    bookmarked: false
  },
  {
    id: "demo-8",
    title: "EU Passes AI Liability Directive — Makers Can Be Sued",
    description: "Landmark directive shifts burden of proof to AI developers for high-risk systems.",
    content: null,
    url: "#",
    imageUrl: null,
    publishedAt: h(16),
    source: { id: null, name: "Euractiv" },
    category: "tech",
    priority: "important",
    summary: {
      bullets: [
        "Directive allows users to sue AI developers for harm caused by high-risk systems",
        "Burden of proof shifts to developers to show their systems were not at fault",
        "Law comes into force in 2027 with a 2-year compliance window"
      ],
      insight: "This is the most significant AI legal shift since GDPR — every EU-facing AI product needs a legal review now.",
      conclusion: "Legal teams at every AI company are already revising their risk disclosures.",
      model: "nvidia/llama-3.3-nemotron-super-49b-v1",
      confidence: 0.89,
      retrievedContext: []
    },
    likeCount: 0,
    likedByViewer: false,
    bookmarked: false
  }
];
