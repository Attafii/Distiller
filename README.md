# Distiller

Distiller is a personal news intelligence app that turns NewsAPI articles into a minimalist, dark-mode feed of grounded 3-bullet summaries.

This guide is structured to be copy-paste friendly for a Next.js 15 App Router project and is optimized for NVIDIA Build hosted LLMs, with a retrieval layer that uses embeddings to reduce token usage and hallucinations.

## 1. Architecture Decisions

Keep the browser focused on presentation and interaction. Put NewsAPI access, NVIDIA Build calls, and retrieval logic on the server.

Summary flow:

1. Fetch articles from NewsAPI on the server.
2. Chunk the article text into compact semantic blocks.
3. Embed the query and chunks, then retrieve the most relevant snippets.
4. Route the request to the right NVIDIA Build model based on user intent and article complexity.
5. Ask the model for exactly 3 grounded bullet points.
6. Validate the shape with Zod before rendering anything in the feed.
7. Let the assistant parse a free-form question, search the latest articles, and answer with the strongest sources.
8. Cache GitHub star counts so the top-right badge stays responsive without hitting the API on every render.

Why this helps:
- RAG keeps the prompt small, which saves tokens.
- Embeddings let you pass only the most relevant context to the LLM.
- Low temperature and strict JSON output reduce hallucination.
- Schema validation gives you a safe fallback when the upstream model misbehaves.

> Note: NewsAPI does not natively push websocket events. In production on serverless platforms, prefer SSE or a managed realtime provider for live updates. If you need WebSocket delivery, place the realtime relay on a separate Node service instead of inside a serverless function.

## 2. Suggested Project Structure

```text
app/
	api/
		feed/route.ts
		github/
			stars/route.ts
		news/
			assistant/route.ts
			chat/route.ts
			full-text/route.ts
			like/route.ts
	RefinedFeed/
		page.tsx
	page.tsx
	loading.tsx
	error.tsx
	globals.css
	layout.tsx
components/
	GitHubRepoWidget.tsx
	NewsAssistant.tsx
	DistilledCard.tsx
	NewsArticleModal.tsx
	ui/
		badge.tsx
		button.tsx
		card.tsx
lib/
	ai.ts
	github.ts
	news-assistant.ts
	rag.ts
	utils.ts
services/
	newsapi.ts
types/
	news.ts
```

If you use shadcn/ui, generate the core primitives first:

```bash
npx shadcn@latest init
npx shadcn@latest add button card badge separator skeleton
```

## 3. Config Files

### `package.json`

```json
{
	"name": "distiller",
	"private": true,
	"version": "0.1.0",
	"scripts": {
		"dev": "next dev",
		"build": "next build",
		"start": "next start",
		"lint": "next lint"
	},
	"dependencies": {
		"clsx": "^2.1.1",
		"class-variance-authority": "^0.7.1",
		"framer-motion": "^12.0.0",
		"compromise": "^14.15.0",
		"lucide-react": "^0.475.0",
		"next": "15.5.15",
		"react": "19.0.0",
		"react-dom": "19.0.0",
		"tailwind-merge": "^3.0.1",
		"zod": "^3.24.2"
	},
	"devDependencies": {
		"@types/node": "^22.13.4",
		"@types/react": "^19.0.10",
		"@types/react-dom": "^19.0.4",
		"autoprefixer": "^10.4.20",
		"eslint": "^9.19.0",
		"eslint-config-next": "15.5.15",
		"postcss": "^8.5.1",
		"tailwindcss": "^3.4.17",
		"typescript": "^6.0.2"
	}
}
```

### `tsconfig.json`

```json
{
	"compilerOptions": {
		"target": "ES2022",
		"lib": ["dom", "dom.iterable", "es2022"],
		"allowJs": false,
		"skipLibCheck": true,
		"strict": true,
		"noEmit": true,
		"esModuleInterop": true,
		"module": "ESNext",
		"moduleResolution": "Bundler",
		"resolveJsonModule": true,
		"isolatedModules": true,
		"jsx": "preserve",
		"incremental": true,
		"baseUrl": ".",
		"paths": {
			"@/*": ["./*"]
		},
		"plugins": [{ "name": "next" }]
	},
	"include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
	"exclude": ["node_modules"]
}
```

### `next.config.mjs`

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	experimental: {
		optimizePackageImports: ["lucide-react"]
	}
};

export default nextConfig;
```

### `postcss.config.mjs`

```js
export default {
	plugins: {
		tailwindcss: {},
		autoprefixer: {}
	}
};
```

### `tailwind.config.ts`

```ts
import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class"],
	content: [
		"./app/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./lib/**/*.{ts,tsx}",
		"./services/**/*.{ts,tsx}"
	],
	theme: {
		extend: {
			colors: {
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))"
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))"
				},
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))"
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))"
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))"
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))"
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))"
				},
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))"
			},
			boxShadow: {
				soft: "0 10px 30px rgba(0, 0, 0, 0.35)"
			}
		}
	},
	plugins: []
};

export default config;
```

### `components.json`

```json
{
	"$schema": "https://ui.shadcn.com/schema.json",
	"style": "new-york",
	"rsc": true,
	"tsx": true,
	"tailwind": {
		"config": "tailwind.config.ts",
		"css": "app/globals.css",
		"baseColor": "zinc",
		"cssVariables": true
	},
	"aliases": {
		"components": "@/components",
		"utils": "@/lib/utils"
	}
}
```

### New endpoints

- `POST /api/news/assistant` searches the current article corpus, ranks the best matches, and returns a detailed answer with source links.
- `GET /api/github/stars` returns the cached GitHub star count and the star-flow link used by the top-right badge.

### Suggested env vars

- `NEWSAPI_KEY` keeps the article feed connected to NewsAPI.
- `NVIDIA_BUILD_API_KEY` enables grounded summaries and assistant answers.
- `GITHUB_REPOSITORY` overrides the GitHub repo slug used by the star widget.
- `GITHUB_TOKEN` or `GITHUB_API_TOKEN` can be set to raise GitHub API limits.

### `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
	color-scheme: dark;
	--background: 240 10% 4%;
	--foreground: 0 0% 98%;
	--card: 240 6% 8%;
	--card-foreground: 0 0% 98%;
	--popover: 240 6% 8%;
	--popover-foreground: 0 0% 98%;
	--primary: 0 0% 98%;
	--primary-foreground: 240 10% 4%;
	--secondary: 240 4% 12%;
	--secondary-foreground: 0 0% 98%;
	--muted: 240 4% 12%;
	--muted-foreground: 240 5% 64%;
	--accent: 240 4% 16%;
	--accent-foreground: 0 0% 98%;
	--destructive: 0 62.8% 30.6%;
	--destructive-foreground: 0 0% 98%;
	--border: 240 4% 16%;
	--input: 240 4% 16%;
	--ring: 240 5% 84%;
	--radius: 0.75rem;
}

@layer base {
	* {
		@apply border-border;
	}

	html,
	body {
		@apply min-h-screen bg-zinc-950 text-zinc-100 antialiased;
	}

	body {
		background-image: radial-gradient(circle at top, rgba(255, 255, 255, 0.04), transparent 35%);
	}
}
```

### `app/layout.tsx`

```tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
	title: "Distiller",
	description: "AI news intelligence feed"
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" className="dark">
			<body>{children}</body>
		</html>
	);
}
```

### `.env.example`

```env
NEWSAPI_KEY=
NEWSAPI_BASE_URL=https://newsapi.org/v2

NVIDIA_BUILD_API_KEY=
NVIDIA_BUILD_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_BUILD_MODEL_FAST=meta/llama-3.1-8b-instruct
NVIDIA_BUILD_MODEL_BALANCED=meta/llama-3.1-70b-instruct
NVIDIA_BUILD_MODEL_DEEP=meta/llama-3.3-70b-instruct
NVIDIA_BUILD_EMBED_MODEL=nvidia/nv-embedqa-e5-v5

DISTILL_BATCH_SIZE=3
NEWS_COUNTRY=us
```

### `lib/utils.ts`

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
```

## 4. Type Definitions

### `types/news.ts`

```ts
export type Category = "tech" | "science" | "business";
export type SummarizationMode = "auto" | "fast" | "balanced" | "deep";

export interface NewsSource {
	id: string | null;
	name: string;
}

export interface NewsArticle {
	id: string;
	title: string;
	description: string | null;
	content: string | null;
	url: string;
	imageUrl: string | null;
	publishedAt: string;
	source: NewsSource;
	category: Category;
}

export interface DistilledSummary {
	bullets: [string, string, string];
	model: string;
	confidence: number;
	retrievedContext: string[];
}

export interface DistilledArticle extends NewsArticle {
	summary: DistilledSummary;
}

export interface FeedResponse {
	articles: DistilledArticle[];
	totalResults: number;
	page: number;
	pageSize: number;
	hasMore: boolean;
}
```

## 5. RAG and Embeddings Layer

The retrieval layer keeps the prompt compact and grounded.

- It removes repeated whitespace.
- It chunks long articles into semantic blocks.
- It embeds the query and each chunk.
- It ranks chunks using cosine similarity plus a small lexical boost.
- It passes only the top snippets to the NVIDIA Build model.

This is the main lever for token savings and hallucination control.

### `lib/rag.ts`

```ts
import "server-only";

import { createHash } from "crypto";
import type { NewsArticle } from "@/types/news";

const embeddingCache = new Map<string, number[]>();

export interface RagContext {
	snippets: string[];
	context: string;
	tokenEstimate: number;
}

export function estimateTokens(text: string): number {
	return Math.max(1, Math.ceil(text.length / 4));
}

export function chunkText(text: string, chunkSize = 900, overlap = 120): string[] {
	const cleaned = text.replace(/\s+/g, " ").trim();
	if (!cleaned) {
		return [];
	}

	if (cleaned.length <= chunkSize) {
		return [cleaned];
	}

	const chunks: string[] = [];
	let start = 0;

	while (start < cleaned.length) {
		const end = Math.min(start + chunkSize, cleaned.length);
		chunks.push(cleaned.slice(start, end).trim());

		if (end >= cleaned.length) {
			break;
		}

		start = Math.max(end - overlap, start + 1);
	}

	return chunks.filter(Boolean);
}

function hashText(text: string): string {
	return createHash("sha1").update(text).digest("hex");
}

function cosineSimilarity(left: number[], right: number[]): number {
	let dot = 0;
	let leftMagnitude = 0;
	let rightMagnitude = 0;

	for (let index = 0; index < Math.min(left.length, right.length); index += 1) {
		dot += left[index] * right[index];
		leftMagnitude += left[index] * left[index];
		rightMagnitude += right[index] * right[index];
	}

	if (!leftMagnitude || !rightMagnitude) {
		return 0;
	}

	return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
}

function lexicalBoost(chunk: string, query: string): number {
	const queryWords = query.toLowerCase().split(/\W+/).filter((word) => word.length > 4);
	if (!queryWords.length) {
		return 0;
	}

	const haystack = chunk.toLowerCase();
	const hits = queryWords.filter((word) => haystack.includes(word)).length;
	return hits * 0.03;
}

async function embedText(text: string): Promise<number[]> {
	const cacheKey = hashText(text);
	const cached = embeddingCache.get(cacheKey);
	if (cached) {
		return cached;
	}

	const baseUrl = process.env.NVIDIA_BUILD_BASE_URL ?? "https://integrate.api.nvidia.com/v1";
	const apiKey = process.env.NVIDIA_BUILD_API_KEY;
	const embeddingModel = process.env.NVIDIA_BUILD_EMBED_MODEL ?? "nvidia/nv-embedqa-e5-v5";

	if (!apiKey) {
		throw new Error("Missing NVIDIA_BUILD_API_KEY");
	}

	const response = await fetch(`${baseUrl}/embeddings`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			model: embeddingModel,
			input: text
		}),
		cache: "no-store"
	});

	if (!response.ok) {
		throw new Error(`Embedding request failed with status ${response.status}`);
	}

	const payload = (await response.json()) as {
		data?: Array<{ embedding?: number[] }>;
	};

	const embedding = payload.data?.[0]?.embedding;
	if (!embedding) {
		throw new Error("Embedding response did not include a vector");
	}

	embeddingCache.set(cacheKey, embedding);
	return embedding;
}

export async function buildRagContext(
	article: Pick<NewsArticle, "title" | "description" | "content">,
	query?: string,
	maxChunks = 3
): Promise<RagContext> {
	const sourceText = [article.title, article.description, article.content].filter(Boolean).join("\n\n");
	const normalizedText = sourceText.trim();

	if (!normalizedText) {
		return {
			snippets: [],
			context: "",
			tokenEstimate: 0
		};
	}

	if (estimateTokens(normalizedText) <= 220) {
		return {
			snippets: [normalizedText],
			context: normalizedText,
			tokenEstimate: estimateTokens(normalizedText)
		};
	}

	const chunks = chunkText(normalizedText);
	const queryText = query ?? `${article.title}\n${article.description ?? ""}`.trim();

	const [queryEmbedding, ...chunkEmbeddings] = await Promise.all([
		embedText(queryText),
		...chunks.map((chunk) => embedText(chunk))
	]);

	const rankedChunks = chunks
		.map((chunk, index) => ({
			chunk,
			score: cosineSimilarity(queryEmbedding, chunkEmbeddings[index]) + lexicalBoost(chunk, queryText)
		}))
		.sort((left, right) => right.score - left.score)
		.slice(0, maxChunks);

	const snippets = rankedChunks.map((entry) => entry.chunk);

	return {
		snippets,
		context: snippets.map((snippet, index) => `Snippet ${index + 1}: ${snippet}`).join("\n\n"),
		tokenEstimate: snippets.reduce((sum, snippet) => sum + estimateTokens(snippet), 0)
	};
}
```

## 6. DistillService with NVIDIA Build Routing

The service below selects a model tier based on article size and user intent:

- `fast` for short, routine summaries.
- `balanced` for the default case.
- `deep` for long or dense stories.

It also retries rate-limited requests, validates the JSON result, and falls back to smaller models if the preferred model fails.

### `lib/ai.ts`

```ts
import "server-only";

import { z } from "zod";

import { buildRagContext, estimateTokens } from "@/lib/rag";
import type {
	DistilledSummary,
	NewsArticle,
	SummarizationMode
} from "@/types/news";

type ModelTier = "fast" | "balanced" | "deep";

const summarySchema = z.object({
	bullets: z.tuple([z.string().min(1), z.string().min(1), z.string().min(1)])
});

const completionSchema = z.object({
	choices: z.array(
		z.object({
			message: z.object({
				content: z.string().default("")
			})
		})
	)
});

const MODEL_MAP: Record<ModelTier, string> = {
	fast: process.env.NVIDIA_BUILD_MODEL_FAST ?? "meta/llama-3.1-8b-instruct",
	balanced: process.env.NVIDIA_BUILD_MODEL_BALANCED ?? "meta/llama-3.1-70b-instruct",
	deep: process.env.NVIDIA_BUILD_MODEL_DEEP ?? "meta/llama-3.3-70b-instruct"
};

const SYSTEM_PROMPT = [
	"You are Distiller, a strict news summarization engine.",
	"Use only the provided source material.",
	"Return exactly 3 concise bullet points.",
	"Never invent facts, numbers, quotes, or motives.",
	"If the article is thin, make uncertainty explicit instead of guessing.",
	'Return JSON only in the shape: {"bullets":["...","...","..."]}'
].join(" ");

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class DistillServiceError extends Error {
	constructor(message: string, public readonly statusCode = 500) {
		super(message);
		this.name = "DistillServiceError";
	}
}

export class DistillRateLimitError extends DistillServiceError {
	constructor(message: string, public readonly retryAfterMs: number) {
		super(message, 429);
		this.name = "DistillRateLimitError";
	}
}

interface DistillServiceConfig {
	apiKey: string;
	baseUrl: string;
}

export interface SummarizeArticleInput {
	article: NewsArticle;
	mode?: SummarizationMode;
	query?: string;
}

export class DistillService {
	private readonly config: DistillServiceConfig;

	constructor(config: Partial<DistillServiceConfig> = {}) {
		this.config = {
			apiKey: config.apiKey ?? process.env.NVIDIA_BUILD_API_KEY ?? "",
			baseUrl: config.baseUrl ?? process.env.NVIDIA_BUILD_BASE_URL ?? "https://integrate.api.nvidia.com/v1"
		};
	}

	static fromEnv() {
		return new DistillService();
	}

	private pickTier(article: NewsArticle, mode: SummarizationMode, tokenEstimate: number): ModelTier {
		if (mode === "fast") {
			return "fast";
		}

		if (mode === "balanced") {
			return "balanced";
		}

		if (mode === "deep") {
			return "deep";
		}

		if (tokenEstimate < 220) {
			return "fast";
		}

		if (tokenEstimate < 700) {
			return "balanced";
		}

		return article.content ? "deep" : "balanced";
	}

	private tierCascade(primary: ModelTier): ModelTier[] {
		switch (primary) {
			case "fast":
				return ["fast", "balanced", "deep"];
			case "balanced":
				return ["balanced", "fast", "deep"];
			case "deep":
			default:
				return ["deep", "balanced", "fast"];
		}
	}

	private resolveModel(tier: ModelTier): string {
		return MODEL_MAP[tier];
	}

	private buildPrompt(article: NewsArticle, context: string, tokenEstimate: number, mode: SummarizationMode) {
		return [
			`Mode: ${mode}`,
			`Token budget estimate: ${tokenEstimate}`,
			`Source: ${article.source.name}`,
			`Title: ${article.title}`,
			`Published: ${article.publishedAt}`,
			"",
			"Retrieved context:",
			context || article.description || article.title,
			"",
			"Task:",
			"Summarize this news article into 3 concise bullet points focusing on key insights.",
			"Rules:",
			"- Use only the supplied context.",
			"- Keep each bullet factual and short.",
			"- Avoid repetition across bullets.",
			"- If evidence is weak, say so instead of guessing.",
			'Return JSON only in the exact shape: {"bullets":["...","...","..."]}'
		].join("\n");
	}

	private parseSummary(content: string): [string, string, string] {
		const normalized = content
			.trim()
			.replace(/^```json\s*/i, "")
			.replace(/^```\s*/i, "")
			.replace(/```$/i, "")
			.trim();

		try {
			const parsed = summarySchema.parse(JSON.parse(normalized));
			return parsed.bullets;
		} catch (error) {
			throw new DistillServiceError(
				`Unable to parse NVIDIA Build summary output: ${error instanceof Error ? error.message : "Unknown parse error"}`
			);
		}
	}

	private fallbackSummary(article: NewsArticle): DistilledSummary {
		return {
			bullets: [
				article.title,
				article.description ?? "The article did not include a description, so the story needs a manual review.",
				`Open the original story from ${article.source.name} for full context.`
			],
			model: "fallback",
			confidence: 0.12,
			retrievedContext: []
		};
	}

	private async callModel(tier: ModelTier, prompt: string): Promise<string> {
		if (!this.config.apiKey) {
			throw new DistillServiceError("Missing NVIDIA_BUILD_API_KEY");
		}

		const model = this.resolveModel(tier);
		const endpoint = `${this.config.baseUrl}/chat/completions`;

		for (let attempt = 0; attempt < 3; attempt += 1) {
			const response = await fetch(endpoint, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${this.config.apiKey}`,
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					model,
					messages: [
						{ role: "system", content: SYSTEM_PROMPT },
						{ role: "user", content: prompt }
					],
					temperature: 0.2,
					top_p: 0.9,
					max_tokens: 220,
					response_format: { type: "json_object" }
				}),
				cache: "no-store"
			});

			if (response.ok) {
				const payload = completionSchema.parse(await response.json());
				return payload.choices[0]?.message?.content ?? "";
			}

			if (response.status === 429) {
				const retryAfterSeconds = Number(response.headers.get("retry-after") ?? "1");
				if (attempt < 2) {
					await sleep((retryAfterSeconds + attempt) * 1000);
					continue;
				}

				throw new DistillRateLimitError("NVIDIA Build rate limit exceeded", retryAfterSeconds * 1000);
			}

			if (response.status >= 500 && attempt < 2) {
				await sleep((attempt + 1) * 500);
				continue;
			}

			const errorBody = await response.text();
			throw new DistillServiceError(
				`NVIDIA Build request failed with status ${response.status}: ${errorBody}`,
				response.status
			);
		}

		throw new DistillServiceError("NVIDIA Build request failed after retries");
	}

	async summarizeArticle(input: SummarizeArticleInput): Promise<DistilledSummary> {
		const { article, mode = "auto", query } = input;
		const articleText = [article.title, article.description, article.content].filter(Boolean).join("\n\n");
		const tokenEstimate = estimateTokens(articleText);
		const ragContext = await buildRagContext(article, query ?? article.title, 3);
		const primaryTier = this.pickTier(article, mode, tokenEstimate);
		const cascade = this.tierCascade(primaryTier);
		let lastError: unknown = null;

		for (const tier of cascade) {
			try {
				const prompt = this.buildPrompt(article, ragContext.context, tokenEstimate, mode);
				const content = await this.callModel(tier, prompt);
				const bullets = this.parseSummary(content);

				return {
					bullets,
					model: this.resolveModel(tier),
					confidence: Math.min(0.98, 0.65 + ragContext.snippets.length * 0.08 + (ragContext.tokenEstimate < 500 ? 0.08 : 0)),
					retrievedContext: ragContext.snippets
				};
			} catch (error) {
				lastError = error;
			}
		}

		if (lastError instanceof DistillRateLimitError) {
			throw lastError;
		}

		if (lastError instanceof DistillServiceError) {
			throw lastError;
		}

		return this.fallbackSummary(article);
	}

	async summarizeArticles(items: SummarizeArticleInput[]): Promise<DistilledSummary[]> {
		return Promise.all(items.map((item) => this.summarizeArticle(item).catch(() => this.fallbackSummary(item.article))));
	}
}
```

## 7. NewsAPI Integration and Feed API Route

The client should never talk to NewsAPI directly. Keep the API key on the server and expose a single feed endpoint that returns already distilled articles.

### `services/newsapi.ts`

```ts
import "server-only";

import type { Category, NewsArticle } from "@/types/news";

const NEWS_BASE_URL = process.env.NEWSAPI_BASE_URL ?? "https://newsapi.org/v2";
const NEWS_API_KEY = process.env.NEWSAPI_KEY ?? "";

const categoryMap: Record<Category, "technology" | "science" | "business"> = {
	tech: "technology",
	science: "science",
	business: "business"
};

export class NewsApiError extends Error {
	constructor(message: string, public readonly statusCode = 500) {
		super(message);
		this.name = "NewsApiError";
	}
}

export interface FetchNewsArticlesInput {
	category: Category;
	page: number;
	pageSize: number;
}

export async function fetchNewsArticles({ category, page, pageSize }: FetchNewsArticlesInput): Promise<{
	articles: NewsArticle[];
	totalResults: number;
}> {
	if (!NEWS_API_KEY) {
		throw new NewsApiError("Missing NEWSAPI_KEY");
	}

	const params = new URLSearchParams({
		apiKey: NEWS_API_KEY,
		category: categoryMap[category],
		page: String(page),
		pageSize: String(pageSize),
		language: "en",
		sortBy: "publishedAt",
		country: process.env.NEWS_COUNTRY ?? "us"
	});

	const response = await fetch(`${NEWS_BASE_URL}/top-headlines?${params.toString()}`, {
		cache: "no-store"
	});

	if (!response.ok) {
		const message = await response.text();
		throw new NewsApiError(`NewsAPI request failed with status ${response.status}: ${message}`, response.status);
	}

	const payload = (await response.json()) as {
		totalResults?: number;
		articles?: Array<{
			source?: { id?: string | null; name?: string };
			title?: string | null;
			description?: string | null;
			content?: string | null;
			url?: string;
			urlToImage?: string | null;
			publishedAt?: string;
		}>;
	};

	const articles = (payload.articles ?? [])
		.filter((article) => Boolean(article.title && article.url && article.publishedAt))
		.map((article, index) => ({
			id: `${article.url}-${index}`,
			title: article.title ?? "",
			description: article.description ?? null,
			content: article.content ?? null,
			url: article.url ?? "",
			imageUrl: article.urlToImage ?? null,
			publishedAt: article.publishedAt ?? new Date().toISOString(),
			source: {
				id: article.source?.id ?? null,
				name: article.source?.name ?? "Unknown source"
			},
			category
		}));

	return {
		articles,
		totalResults: payload.totalResults ?? articles.length
	};
}
```

### `app/api/feed/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { DistillService } from "@/lib/ai";
import { fetchNewsArticles } from "@/services/newsapi";
import type { DistilledArticle, DistilledSummary, NewsArticle } from "@/types/news";

const querySchema = z.object({
	category: z.enum(["tech", "science", "business"]).default("tech"),
	page: z.coerce.number().int().positive().default(1),
	pageSize: z.coerce.number().int().min(1).max(12).default(6),
	mode: z.enum(["auto", "fast", "balanced", "deep"]).default("auto")
});

function fallbackSummary(article: NewsArticle): DistilledSummary {
	return {
		bullets: [
			article.title,
			article.description ?? "The article did not provide a description, so it needs manual review.",
			`Open the original story from ${article.source.name} for full context.`
		],
		model: "fallback",
		confidence: 0.12,
		retrievedContext: []
	};
}

export async function GET(request: NextRequest) {
	const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));

	if (!parsed.success) {
		return NextResponse.json(
			{
				error: "Invalid query params",
				details: parsed.error.flatten()
			},
			{ status: 400 }
		);
	}

	const { category, page, pageSize, mode } = parsed.data;

	try {
		const { articles, totalResults } = await fetchNewsArticles({ category, page, pageSize });
		const distillService = DistillService.fromEnv();
		const batchSize = Number(process.env.DISTILL_BATCH_SIZE ?? "3");
		const distilled: DistilledArticle[] = [];

		for (let index = 0; index < articles.length; index += batchSize) {
			const batch = articles.slice(index, index + batchSize);
			const batchResults = await Promise.all(
				batch.map(async (article) => {
					try {
						const summary = await distillService.summarizeArticle({ article, mode });
						return { ...article, summary };
					} catch {
						return { ...article, summary: fallbackSummary(article) };
					}
				})
			);

			distilled.push(...batchResults);
		}

		return NextResponse.json({
			articles: distilled,
			totalResults,
			page,
			pageSize,
			hasMore: page * pageSize < totalResults
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown feed error";
		return NextResponse.json({ error: message }, { status: 502 });
	}
}
```

## 8. DistilledCard Component

The card should always put the AI summary first. The original description is secondary, muted, and visually lower in the hierarchy.

### `components/DistilledCard.tsx`

```tsx
"use client";

import { useState } from "react";

import { motion } from "framer-motion";
import { Copy, ExternalLink, Sparkles } from "lucide-react";

import type { DistilledArticle } from "@/types/news";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

function formatPublishedAt(publishedAt: string) {
	return new Intl.DateTimeFormat("en", {
		dateStyle: "medium",
		timeStyle: "short"
	}).format(new Date(publishedAt));
}

export function DistilledCard({ article }: { article: DistilledArticle }) {
	const [copied, setCopied] = useState(false);

	const copySummary = async () => {
		await navigator.clipboard.writeText(article.summary.bullets.join("\n"));
		setCopied(true);
		window.setTimeout(() => setCopied(false), 1500);
	};

	return (
		<motion.article
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.35, ease: "easeOut" }}
			whileHover={{ y: -3 }}
			className="h-full"
		>
			<Card className="flex h-full flex-col border-zinc-800 bg-zinc-950/90 shadow-soft backdrop-blur">
				<CardHeader className="space-y-4">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<Badge variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-200">
							<Sparkles className="mr-2 h-3.5 w-3.5" />
							AI Summary
						</Badge>
						<Badge variant="outline" className="border-zinc-800 bg-zinc-900 text-zinc-400">
							{article.category}
						</Badge>
					</div>

					<div className="space-y-2">
						<h3 className="text-lg font-semibold leading-snug text-zinc-100">
							{article.title}
						</h3>
						<p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
							{article.source.name} · {formatPublishedAt(article.publishedAt)}
						</p>
					</div>
				</CardHeader>

				<CardContent className="flex-1 space-y-5">
					<section aria-label="AI summary" className="space-y-3">
						<div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-zinc-500">
							<span>Distilled insights</span>
							<span>{Math.round(article.summary.confidence * 100)}% confidence</span>
						</div>

						<ul className="space-y-3">
							{article.summary.bullets.map((bullet) => (
								<li
									key={bullet}
									className="rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm leading-relaxed text-zinc-200"
								>
									{bullet}
								</li>
							))}
						</ul>
					</section>

					{article.description ? (
						<p className="text-sm leading-relaxed text-zinc-400">
							{article.description}
						</p>
					) : null}
				</CardContent>

				<CardFooter className="flex flex-wrap gap-2 border-t border-zinc-800 pt-4">
					<Button variant="ghost" className="text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100" onClick={copySummary}>
						<Copy className="mr-2 h-4 w-4" />
						{copied ? "Copied" : "Copy summary"}
					</Button>

					<Button asChild className="ml-auto bg-zinc-100 text-zinc-950 hover:bg-zinc-300">
						<a href={article.url} target="_blank" rel="noreferrer">
							Read original
							<ExternalLink className="ml-2 h-4 w-4" />
						</a>
					</Button>
				</CardFooter>
			</Card>
		</motion.article>
	);
}
```

## 9. RefinedFeed Page

This page owns category state, pagination, loading states, and the infinite scroll sentinel. It calls the server feed route and renders DistilledCard for each item.

### `app/RefinedFeed/page.tsx`

```tsx
"use client";

import { useEffect, useRef, useState } from "react";

import { Loader2, Newspaper, RefreshCcw } from "lucide-react";

import { DistilledCard } from "@/components/DistilledCard";
import type { Category, DistilledArticle, FeedResponse } from "@/types/news";

const categories: Array<{ id: Category; label: string }> = [
	{ id: "tech", label: "Tech" },
	{ id: "science", label: "Science" },
	{ id: "business", label: "Business" }
];

function FeedSkeleton() {
	return (
		<div className="grid gap-5 lg:grid-cols-2">
			{Array.from({ length: 4 }).map((_, index) => (
				<div
					key={index}
					className="animate-pulse rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
				>
					<div className="mb-4 h-4 w-28 rounded-full bg-zinc-800" />
					<div className="mb-3 h-6 w-4/5 rounded-full bg-zinc-800" />
					<div className="space-y-3">
						<div className="h-16 rounded-2xl bg-zinc-800/80" />
						<div className="h-16 rounded-2xl bg-zinc-800/80" />
						<div className="h-16 rounded-2xl bg-zinc-800/80" />
					</div>
				</div>
			))}
		</div>
	);
}

function EmptyState() {
	return (
		<div className="rounded-3xl border border-zinc-800 bg-zinc-900 px-6 py-12 text-center">
			<p className="text-sm uppercase tracking-[0.25em] text-zinc-500">No articles yet</p>
			<p className="mx-auto mt-3 max-w-md text-sm text-zinc-400">
				Try another category or refresh the feed to pull new stories from NewsAPI.
			</p>
		</div>
	);
}

export default function RefinedFeedPage() {
	const [category, setCategory] = useState<Category>("tech");
	const [articles, setArticles] = useState<DistilledArticle[]>([]);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const sentinelRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const controller = new AbortController();

		async function loadFeed() {
			setLoading(true);
			setError(null);

			try {
				const params = new URLSearchParams({
					category,
					page: String(page),
					pageSize: "6",
					mode: "auto"
				});

				const response = await fetch(`/api/feed?${params.toString()}`, {
					signal: controller.signal,
					cache: "no-store"
				});

				if (!response.ok) {
					const message = await response.text();
					throw new Error(message || "Failed to load feed");
				}

				const data = (await response.json()) as FeedResponse;

				setArticles((current) => (page === 1 ? data.articles : [...current, ...data.articles]));
				setHasMore(data.hasMore);
			} catch (fetchError) {
				if ((fetchError as DOMException).name !== "AbortError") {
					setError(fetchError instanceof Error ? fetchError.message : "Unknown error");
				}
			} finally {
				setLoading(false);
			}
		}

		loadFeed();
		return () => controller.abort();
	}, [category, page]);

	useEffect(() => {
		const node = sentinelRef.current;
		if (!node) {
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && hasMore && !loading) {
					setPage((current) => current + 1);
				}
			},
			{ rootMargin: "240px" }
		);

		observer.observe(node);
		return () => observer.disconnect();
	}, [hasMore, loading]);

	const resetFeed = (nextCategory: Category) => {
		setCategory(nextCategory);
		setPage(1);
		setArticles([]);
		setHasMore(true);
	};

	const retry = () => {
		setPage(1);
		setArticles([]);
		setHasMore(true);
		setError(null);
	};

	return (
		<main className="min-h-screen bg-zinc-950 text-zinc-100">
			<section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
				<div className="mb-8 flex flex-col gap-6 border-b border-zinc-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Distiller</p>
						<h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
							Refined Feed
						</h1>
						<p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
							A monochrome news feed with AI summaries routed through NVIDIA Build, grounded with retrieval, and trimmed for token efficiency.
						</p>
					</div>

					<div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs uppercase tracking-[0.25em] text-zinc-400">
						<Newspaper className="h-4 w-4" />
						NewsAPI + NVIDIA Build
					</div>
				</div>

				<div className="mb-8 flex flex-wrap gap-2">
					{categories.map((option) => {
						const active = option.id === category;
						return (
							<button
								key={option.id}
								type="button"
								onClick={() => resetFeed(option.id)}
								className={`rounded-full border px-4 py-2 text-sm transition ${
									active
										? "border-zinc-100 bg-zinc-100 text-zinc-950"
										: "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-100"
								}`}
							>
								{option.label}
							</button>
						);
					})}

					<button
						type="button"
						onClick={retry}
						className="ml-auto inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-700 hover:text-zinc-100"
					>
						<RefreshCcw className="h-4 w-4" />
						Refresh
					</button>
				</div>

				{error ? (
					<div
						className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-900 px-6 py-4 text-sm text-zinc-300"
						role="alert"
						aria-live="polite"
					>
						<p className="font-medium text-zinc-100">Unable to load the feed</p>
						<p className="mt-1 text-zinc-400">{error}</p>
					</div>
				) : null}

				{loading && articles.length === 0 ? <FeedSkeleton /> : null}

				{!loading && articles.length === 0 && !error ? <EmptyState /> : null}

				{articles.length > 0 ? (
					<div className="grid gap-5 lg:grid-cols-2">
						{articles.map((article) => (
							<DistilledCard key={article.id} article={article} />
						))}
					</div>
				) : null}

				<div ref={sentinelRef} className="h-12" />

				{loading && articles.length > 0 ? (
					<div className="mt-6 flex items-center justify-center gap-2 text-sm text-zinc-500">
						<Loader2 className="h-4 w-4 animate-spin" />
						Loading more stories
					</div>
				) : null}

				{!hasMore && articles.length > 0 ? (
					<p className="mt-8 text-center text-xs uppercase tracking-[0.3em] text-zinc-500">
						You reached the end of the current feed
					</p>
				) : null}
			</section>
		</main>
	);
}
```

## 10. Error Boundary

Keep the page resilient even if a route crashes or a runtime error slips past your fetch guards.

### `app/error.tsx`

```tsx
"use client";

import { useEffect } from "react";

import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
	error,
	reset
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<html lang="en">
			<body className="bg-zinc-950 text-zinc-100">
				<main className="flex min-h-screen items-center justify-center p-6">
					<section className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-soft">
						<AlertTriangle className="h-6 w-6 text-zinc-300" />
						<h1 className="mt-4 text-xl font-semibold text-zinc-100">Something went wrong</h1>
						<p className="mt-2 text-sm leading-relaxed text-zinc-400">
							The feed or distillation pipeline failed. Retry to reload the page.
						</p>
						<button
							type="button"
							onClick={reset}
							className="mt-6 inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-300"
						>
							<RotateCcw className="h-4 w-4" />
							Retry
						</button>
					</section>
				</main>
			</body>
		</html>
	);
}
```

## 11. Implementation Notes That Matter in Production

- Keep the NVIDIA Build API key server-side only.
- Keep `temperature` low and `max_tokens` capped.
- Validate model output with Zod so the UI only receives exactly 3 bullets.
- Cache embeddings by content hash to avoid repeated calls for the same article text.
- Use batch summarization to reduce rate-limit pressure.
- If you later want stronger RAG, move embeddings into a persistent vector store such as pgvector, Upstash Vector, or Pinecone.
- If you need true realtime updates, place the websocket relay outside your serverless Next.js runtime and keep the page transport-agnostic.

## 12. Minimal Build Checklist

1. Add the config files.
2. Generate the shadcn/ui primitives.
3. Create the type definitions.
4. Add `lib/rag.ts` and `lib/ai.ts`.
5. Wire `services/newsapi.ts` and `app/api/feed/route.ts`.
6. Build `components/DistilledCard.tsx`.
7. Drop in `app/RefinedFeed/page.tsx`.
8. Add `app/error.tsx`.
9. Populate `.env.local` from `.env.example`.
10. Run `pnpm dev` or `npm run dev` and verify the feed loads.

The result is a monochromatic, fast, and production-aware foundation for Distiller that keeps AI summaries concise, grounded, and cheap to generate.
