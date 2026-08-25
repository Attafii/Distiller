export const TOPICS = [
  "World",
  "Politics",
  "Technology",
  "AI",
  "Science",
  "Business",
  "Finance",
  "Stocks",
  "Climate",
  "Health",
  "Education",
  "Sports",
  "Entertainment",
  "Culture",
  "LLM",
] as const;

export const REGIONS = [
  "World",
  "North America",
  "Europe",
  "Asia",
  "MENA",
  "Africa",
  "Latin America",
  "Oceania",
  "USA",
  "UK",
  "France",
  "Germany",
  "China",
  "India",
  "Tunisia",
] as const;

export const FREE_TOPICS = 2;
export const FREE_ARTICLES_PER_MONTH = 50;

/** Each topic separates out at its own wavelength. */
export const TOPIC_META: Record<
  string,
  { color: string; blurb: string }
> = {
  World: { color: "sky", blurb: "Global affairs" },
  Politics: { color: "plum", blurb: "Power & policy" },
  Technology: { color: "indigo", blurb: "Silicon & systems" },
  AI: { color: "violet", blurb: "Frontier models" },
  Science: { color: "teal", blurb: "Discovery" },
  Business: { color: "brass", blurb: "Companies" },
  Finance: { color: "forest", blurb: "Rates & capital" },
  Stocks: { color: "lime", blurb: "Markets" },
  Climate: { color: "forest", blurb: "Energy & earth" },
  Health: { color: "rose", blurb: "Medicine" },
  Education: { color: "amber", blurb: "Learning" },
  Sports: { color: "ember", blurb: "Competition" },
  Entertainment: { color: "plum", blurb: "Screen & stage" },
  Culture: { color: "violet", blurb: "Art & ideas" },
  LLM: { color: "indigo", blurb: "Language models" },
};

/** Lowercase aliases — the app's feed categories resolve to the same spectrum. */
const TOPIC_ALIASES: Record<string, { color: string; blurb: string }> = {
  world: TOPIC_META.World,
  politics: TOPIC_META.Politics,
  tech: TOPIC_META.Technology,
  technology: TOPIC_META.Technology,
  ai: TOPIC_META.AI,
  llm: TOPIC_META.LLM,
  science: TOPIC_META.Science,
  business: TOPIC_META.Business,
  finance: TOPIC_META.Finance,
  stocks: TOPIC_META.Stocks,
  climate: TOPIC_META.Climate,
  health: TOPIC_META.Health,
  education: TOPIC_META.Education,
  sports: TOPIC_META.Sports,
  entertainment: TOPIC_META.Entertainment,
  culture: TOPIC_META.Culture
};

export const TOPIC_META_FULL: Record<string, { color: string; blurb: string }> = {
  ...TOPIC_META,
  ...TOPIC_ALIASES
};

export function topicColor(topic: string): string {
  return `var(--color-${TOPIC_META_FULL[topic?.toLowerCase()]?.color ?? TOPIC_META[topic]?.color ?? "ember"})`;
}

export const REGION_GROUPS: { label: string; regions: string[] }[] = [
  { label: "Global", regions: ["World"] },
  {
    label: "Continents",
    regions: ["North America", "Europe", "Asia", "Africa", "Latin America", "Oceania", "MENA"],
  },
  { label: "Countries", regions: ["USA", "UK", "France", "Germany", "China", "India", "Tunisia"] },
];

/** Every region gets its own colour on the globe (RGB 0-1 for cobe). */
export const REGION_RGB: Record<string, [number, number, number]> = {
  World: [0.85, 0.27, 0.11], // ember
  "North America": [0.12, 0.44, 0.7], // sky
  Europe: [0.29, 0.34, 0.78], // indigo
  Asia: [0.49, 0.3, 0.8], // violet
  Africa: [0.69, 0.42, 0.04], // amber
  "Latin America": [0.78, 0.18, 0.38], // rose
  Oceania: [0.05, 0.48, 0.41], // teal
  MENA: [0.66, 0.46, 0.05], // brass
  USA: [0.12, 0.44, 0.7],
  UK: [0.29, 0.34, 0.78],
  France: [0.29, 0.34, 0.78],
  Germany: [0.29, 0.34, 0.78],
  China: [0.49, 0.3, 0.8],
  India: [0.49, 0.3, 0.8],
  Tunisia: [0.66, 0.46, 0.05],
};

/** Real coordinates so the globe actually flies to the place. */
export const REGION_COORDS: Record<string, [number, number]> = {
  World: [20, 0],
  "North America": [45, -100],
  Europe: [50, 10],
  Asia: [34, 100],
  Africa: [2, 20],
  "Latin America": [-14, -60],
  Oceania: [-25, 134],
  MENA: [27, 30],
  USA: [39.8, -98.6],
  UK: [54, -2.5],
  France: [46.6, 2.4],
  Germany: [51.2, 10.4],
  China: [35.9, 104.2],
  India: [22.4, 78.9],
  Tunisia: [33.9, 9.5],
};

export const REGION_BLURB: Record<string, string> = {
  World: "Everything, everywhere — the unfiltered stream.",
  "North America": "US, Canada and Mexico desks.",
  Europe: "From Lisbon to Helsinki.",
  Asia: "East, South and Southeast Asia.",
  Africa: "North and Sub-Saharan coverage in one stream.",
  "Latin America": "South and Central America.",
  Oceania: "Australia, New Zealand and the Pacific.",
  MENA: "Middle East and North Africa.",
  USA: "Washington, Wall Street and Silicon Valley.",
  UK: "Westminster, the City and beyond.",
  France: "Paris and the Hexagon.",
  Germany: "Berlin, Frankfurt and the Mittelstand.",
  China: "Beijing, Shenzhen and the supply chain.",
  India: "Delhi, Bengaluru and the subcontinent.",
  Tunisia: "Tunis, Sfax and the olive belt.",
};

export const SUGGESTED_QUESTIONS = [
  "What happened in AI this week?",
  "Latest on climate policy",
  "How are markets doing today?",
  "Biggest science breakthroughs recently",
  "What's new in healthcare?",
  "Sports results this week",
];
