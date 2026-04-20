import "server-only";

import { z } from "zod";

import { buildRagContext, estimateTokens } from "@/lib/rag";
import { fetchWithTimeout } from "@/lib/http";
import { normalizeEnvString } from "@/lib/utils";
import type { ArticleChatMessage, DistilledSummary, NewsAssistantArticleContext, NewsArticle, SummarizationMode } from "@/types/news";
import type { NewsQueryAnalysis } from "@/lib/news-assistant";

type ModelTier = "fast" | "balanced" | "deep";

function uniqueModels(models: Array<string | undefined>): string[] {
  return Array.from(new Set(models.filter((model): model is string => Boolean(model && model.trim()))));
}

const MODEL_CANDIDATES: Record<ModelTier, string[]> = {
  fast: uniqueModels([
    normalizeEnvString(process.env.NVIDIA_BUILD_MODEL_FAST),
    "nvidia/llama-3.1-nemotron-nano-8b-v1",
    "meta/llama-3.1-8b-instruct"
  ]),
  balanced: uniqueModels([
    normalizeEnvString(process.env.NVIDIA_BUILD_MODEL_BALANCED),
    "nvidia/llama-3.3-nemotron-super-49b-v1",
    "meta/llama-3.3-70b-instruct",
    "meta/llama-3.1-70b-instruct"
  ]),
  deep: uniqueModels([
    normalizeEnvString(process.env.NVIDIA_BUILD_MODEL_DEEP),
    "nvidia/llama-3.1-nemotron-ultra-253b-v1",
    "nvidia/llama-3.3-nemotron-super-49b-v1",
    "meta/llama-3.3-70b-instruct"
  ])
};

const completionSchema = z.object({
  choices: z.array(
    z.object({
      message: z.object({
        content: z.string().default("")
      })
    })
  )
});

const summarySchema = z.object({
  bullets: z.array(z.string().min(1)).length(3),
  insight: z.string().min(1),
  conclusion: z.string().min(1)
});

const answerSchema = z.object({
  answer: z.string().min(1)
});

const SYSTEM_PROMPT = [
  "You are Distiller, a strict news summarization engine.",
  "Use only the provided source material.",
  "Return exactly 3 concise bullet points, one insight, and one conclusion.",
  "Never invent facts, numbers, quotes, or motives.",
  "If the article is thin, make uncertainty explicit instead of guessing.",
  'Return JSON only in the shape: {"bullets":["...","...","..."],"insight":"...","conclusion":"..."}'
].join(" ");

const CHAT_SYSTEM_PROMPT = [
  "You are Distiller's article chat assistant.",
  "You are a conversational analyst for one article at a time.",
  "Keep the conversation centered on the article, its claims, framing, implications, strengths, weaknesses, and what to watch next.",
  "You may offer judgment, critique, and interpretation when it helps discuss the article, but clearly separate opinion from direct evidence.",
  "Ground your replies in the article, the summary, the retrieved snippets, and the conversation history.",
  "If the user asks something outside the article's scope, redirect back to the article instead of answering the unrelated topic."
].join(" ");

const NEWS_ASSISTANT_SYSTEM_PROMPT = [
  "You are Distiller's news assistant.",
  "Synthesize the supplied news articles into a detailed, grounded answer.",
  "Use only the provided articles, retrieved snippets, and conversation history.",
  "Clearly separate what is supported by the articles from any interpretation or caveat.",
  "If the coverage is thin or conflicting, say that directly instead of guessing.",
  'Return JSON only in the exact shape: {"answer":"..."}'
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

export interface SummarizeArticleInput {
  article: NewsArticle;
  mode?: SummarizationMode;
  query?: string;
}

interface DistillServiceConfig {
  apiKey: string;
  baseUrl: string;
}

function stripBulletPrefix(value: string): string {
  return value
    .replace(/^\s*[-*•]\s*/, "")
    .replace(/^\s*\d+[.)]\s*/, "")
    .trim();
}

function cleanFenceBlocks(value: string): string {
  return value
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function fallbackBullets(article: NewsArticle, context: string[]): [string, string, string] {
  return [
    article.title,
    article.description ?? context[0] ?? article.content ?? "The story should be reviewed manually for more detail.",
    `Source: ${article.source.name}`
  ];
}

function normalizeLine(value: string): string {
  return value.replace(/^\s*[-*•]\s*/, "").replace(/^\s*\d+[.)]\s*/, "").trim();
}

function firstSentence(value: string): string {
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (!cleaned) {
    return "";
  }

  const sentenceMatch = cleaned.match(/^[^.!?]+[.!?]/);
  return (sentenceMatch?.[0] ?? cleaned).trim();
}

function compactText(value: string, maxLength = 180): string {
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return `${cleaned.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function deriveInsight(article: NewsArticle, contextSnippets: string[]): string {
  return compactText(
    firstSentence(article.description ?? contextSnippets[0] ?? article.content ?? article.title) ||
      `The story centers on ${article.title}.`,
    160
  );
}

function deriveConclusion(article: NewsArticle, contextSnippets: string[]): string {
  const snippet = contextSnippets[1] ?? contextSnippets[0] ?? article.description ?? article.content ?? "";
  return compactText(
    firstSentence(snippet) || `Follow the original report from ${article.source.name} for updates and verification.`,
    160
  );
}

function formatConversation(history: ArticleChatMessage[] | undefined): string {
  return (history ?? [])
    .slice(-8)
    .map((message) => `${message.role === "user" ? "User" : "Assistant"}: ${message.content}`)
    .join("\n");
}

export class DistillService {
  private readonly config: DistillServiceConfig;

  constructor(config: Partial<DistillServiceConfig> = {}) {
    this.config = {
      apiKey: normalizeEnvString(config.apiKey ?? process.env.NVIDIA_BUILD_API_KEY),
      baseUrl: normalizeEnvString(config.baseUrl ?? process.env.NVIDIA_BUILD_BASE_URL, "https://integrate.api.nvidia.com/v1").replace(/\/$/, "")
    };
  }

  static fromEnv() {
    return new DistillService();
  }

  private modelCandidates(tier: ModelTier): string[] {
    const candidates = MODEL_CANDIDATES[tier];

    if (candidates.length > 0) {
      return candidates;
    }

    return tier === "fast"
      ? ["meta/llama-3.1-8b-instruct"]
      : tier === "balanced"
        ? ["meta/llama-3.3-70b-instruct", "meta/llama-3.1-70b-instruct"]
        : ["nvidia/llama-3.1-nemotron-ultra-253b-v1", "meta/llama-3.3-70b-instruct"];
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

    if (tokenEstimate < 180) {
      return "fast";
    }

    if (tokenEstimate < 650) {
      return "balanced";
    }

    return article.content ? "deep" : "balanced";
  }

  private buildPrompt(
    article: NewsArticle,
    context: string,
    tokenEstimate: number,
    mode: SummarizationMode,
    query?: string
  ): string {
    return [
      `Mode: ${mode}`,
      `Token budget estimate: ${tokenEstimate}`,
      `Source: ${article.source.name}`,
      `Title: ${article.title}`,
      `Search focus: ${query ?? article.title}`,
      `Published: ${article.publishedAt}`,
      "",
      "Retrieved context:",
      context || article.description || article.title,
      "",
      "Task:",
      "Summarize this news article into 3 concise bullet points focusing on key insights.",
      "Also provide a one-sentence insight and a one-sentence conclusion.",
      "Rules:",
      "- Use only the supplied context.",
      "- Keep each bullet factual and short.",
      "- Avoid repetition across bullets.",
      "- If evidence is weak, say so instead of guessing.",
      'Return JSON only in the exact shape: {"bullets":["...","...","..."],"insight":"...","conclusion":"..."}'
    ].join("\n");
  }

  private normalizeSummary(
    content: string,
    article: NewsArticle,
    contextSnippets: string[]
  ): Pick<DistilledSummary, "bullets" | "insight" | "conclusion"> {
    const cleaned = cleanFenceBlocks(content);
    const fallbackInsight = deriveInsight(article, contextSnippets);
    const fallbackConclusion = deriveConclusion(article, contextSnippets);

    try {
      const parsedJson = JSON.parse(cleaned) as unknown;
      const parsed = summarySchema.safeParse(parsedJson);
      if (parsed.success) {
        return {
          bullets: parsed.data.bullets.map(stripBulletPrefix) as [string, string, string],
          insight: normalizeLine(parsed.data.insight) || fallbackInsight,
          conclusion: normalizeLine(parsed.data.conclusion) || fallbackConclusion
        };
      }

      if (typeof parsedJson === "object" && parsedJson !== null) {
        const structured = parsedJson as { bullets?: unknown; insight?: unknown; conclusion?: unknown };
        const bullets = structured.bullets;
        if (Array.isArray(bullets)) {
          const normalized = bullets.map((bullet) => stripBulletPrefix(String(bullet))).filter(Boolean);
          if (normalized.length >= 3) {
            return {
              bullets: [normalized[0], normalized[1], normalized[2]],
              insight: typeof structured.insight === "string" && structured.insight.trim() ? normalizeLine(structured.insight) : fallbackInsight,
              conclusion:
                typeof structured.conclusion === "string" && structured.conclusion.trim()
                  ? normalizeLine(structured.conclusion)
                  : fallbackConclusion
            };
          }
        }
      }
    } catch {
      // Fall through to line parsing.
    }

    const lineBullets = cleaned
      .split(/\r?\n+/)
      .map(stripBulletPrefix)
      .filter(Boolean)
      .slice(0, 3);

    if (lineBullets.length >= 3) {
      return {
        bullets: [lineBullets[0], lineBullets[1], lineBullets[2]],
        insight: fallbackInsight,
        conclusion: fallbackConclusion
      };
    }

    const sentenceBullets = cleaned
      .split(/(?<=[.!?])\s+/)
      .map(stripBulletPrefix)
      .filter(Boolean)
      .slice(0, 3);

    if (sentenceBullets.length >= 3) {
      return {
        bullets: [sentenceBullets[0], sentenceBullets[1], sentenceBullets[2]],
        insight: fallbackInsight,
        conclusion: fallbackConclusion
      };
    }

    return this.fallbackSummary(article, contextSnippets);
  }

  private fallbackSummary(article: NewsArticle, contextSnippets: string[]): DistilledSummary {
    return {
      bullets: fallbackBullets(article, contextSnippets),
      insight: deriveInsight(article, contextSnippets),
      conclusion: deriveConclusion(article, contextSnippets),
      model: "fallback",
      confidence: 0.18,
      retrievedContext: contextSnippets
    };
  }

  private async callModelOnce(
    model: string,
    prompt: string,
    systemPrompt = SYSTEM_PROMPT,
    options: { maxTokens?: number } = {}
  ): Promise<string> {
    if (!this.config.apiKey) {
      throw new DistillServiceError("Missing NVIDIA_BUILD_API_KEY");
    }

    const responseEndpoint = `${this.config.baseUrl}/chat/completions`;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      let response: Response;

      try {
        response = await fetchWithTimeout(responseEndpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: prompt }
            ],
            temperature: 0.2,
            top_p: 0.9,
            max_tokens: options.maxTokens ?? 220,
            response_format: {
              type: "json_object"
            }
          }),
          cache: "no-store"
        }, 5000);
      } catch {
        throw new DistillServiceError(`NVIDIA Build request timed out for ${model}`, 504);
      }

      if (response.ok) {
        const payload = (await response.json()) as unknown;
        const parsed = completionSchema.safeParse(payload);

        if (parsed.success) {
          return parsed.data.choices[0]?.message?.content ?? "";
        }

        throw new DistillServiceError("Unexpected NVIDIA Build response shape");
      }

      if (response.status === 429) {
        const retryAfterSeconds = Number(response.headers.get("retry-after") ?? "1");
        if (attempt < 1) {
          await sleep((retryAfterSeconds + attempt) * 1000);
          continue;
        }

        throw new DistillRateLimitError("NVIDIA Build rate limit exceeded", retryAfterSeconds * 1000);
      }

      if (response.status >= 500 && attempt < 1) {
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

  private async callModelForTier(
    tier: ModelTier,
    prompt: string,
    systemPrompt = SYSTEM_PROMPT,
    options: { maxTokens?: number } = {}
  ): Promise<{ model: string; content: string }> {
    let lastError: unknown = null;

    for (const model of this.modelCandidates(tier)) {
      try {
        const content = await this.callModelOnce(model, prompt, systemPrompt, options);
        return { model, content };
      } catch (error) {
        lastError = error;

        if (error instanceof DistillServiceError && error.statusCode === 504) {
          break;
        }
      }
    }

    if (lastError instanceof Error) {
      throw lastError;
    }

    throw new DistillServiceError(`Unable to summarize with any ${tier} tier model`);
  }

  async summarizeArticle(input: SummarizeArticleInput): Promise<DistilledSummary> {
    const { article, mode = "auto", query } = input;
    const articleText = [article.title, article.description, article.content].filter(Boolean).join("\n\n");
    const tokenEstimate = estimateTokens(articleText);
    const ragContext = await buildRagContext(article, query ?? article.title, 3);
    const primaryTier = this.pickTier(article, mode, tokenEstimate);
    const prompt = this.buildPrompt(article, ragContext.context, tokenEstimate, mode, query ?? article.title);

    try {
      const { model, content } = await this.callModelForTier(primaryTier, prompt);
      const summary = this.normalizeSummary(content, article, ragContext.snippets);

      return {
        ...summary,
        model,
        confidence: Math.min(0.98, 0.58 + ragContext.snippets.length * 0.1 + (ragContext.usedEmbeddings ? 0.08 : 0.04)),
        retrievedContext: ragContext.snippets
      };
    } catch (error) {
      if (!(error instanceof DistillServiceError && error.statusCode === 504)) {
        console.error("Distill summary failed", {
          articleId: article.id,
          mode,
          error: error instanceof Error ? error.message : String(error)
        });
      }

      return this.fallbackSummary(article, ragContext.snippets);
    }
  }

  async summarizeArticles(items: SummarizeArticleInput[]): Promise<DistilledSummary[]> {
    return Promise.all(
      items.map((item) =>
        this.summarizeArticle(item).catch(() => this.fallbackSummary(item.article, []))
      )
    );
  }

  async answerQuestion(input: {
    article: NewsArticle;
    summary: DistilledSummary;
    question: string;
    history?: ArticleChatMessage[];
  }): Promise<{ answer: string; model: string; retrievedContext: string[] }> {
    const { article, summary, question, history = [] } = input;
    const ragContext = await buildRagContext(article, question, 5);
    const contextSnippets = ragContext.snippets.length > 0 ? ragContext.snippets : summary.retrievedContext;

    const prompt = [
      `Article title: ${article.title}`,
      `Source: ${article.source.name}`,
      `Published: ${article.publishedAt}`,
      "",
      "Summary bullets:",
      ...summary.bullets.map((bullet) => `- ${bullet}`),
      "",
      `Insight: ${summary.insight}`,
      `Conclusion: ${summary.conclusion}`,
      "",
      "Retrieved context:",
      contextSnippets.length > 0 ? contextSnippets.map((snippet, index) => `Snippet ${index + 1}: ${snippet}`).join("\n\n") : "No extra snippets were available.",
      "",
      "Conversation history:",
      formatConversation(history) || "No prior messages.",
      "",
      `User question: ${question}`,
      "",
      "Respond like a chat partner discussing the article. You can explain what the article suggests, judge its framing, point out missing context, and discuss likely implications.",
      "Stay anchored to the article and context, but do not refuse a question just because it asks for analysis or judgment about the article.",
      "If the question goes beyond the article, gently redirect the user back to the story.",
      "Keep it conversational in two to five sentences.",
      'Return JSON only in the exact shape: {"answer":"..."}'
    ].join("\n");

    try {
      const { model, content } = await this.callModelForTier("balanced", prompt, CHAT_SYSTEM_PROMPT);
      const cleaned = cleanFenceBlocks(content);

      try {
        const parsedJson = JSON.parse(cleaned) as unknown;
        const parsed = answerSchema.safeParse(parsedJson);

        if (parsed.success) {
          return {
            answer: normalizeLine(parsed.data.answer) || this.fallbackChatAnswer(article, summary, question, contextSnippets),
            model,
            retrievedContext: contextSnippets
          };
        }
      } catch {
        // Fall through to text response.
      }

      return {
        answer: normalizeLine(cleaned) || this.fallbackChatAnswer(article, summary, question, contextSnippets),
        model,
        retrievedContext: contextSnippets
      };
    } catch {
      // Chat falls back cleanly when the model times out or fails.

      return {
        answer: this.fallbackChatAnswer(article, summary, question, contextSnippets),
        model: "fallback",
        retrievedContext: contextSnippets
      };
    }
  }

  async answerNewsQuestion(input: {
    question: string;
    analysis: NewsQueryAnalysis;
    articles: NewsAssistantArticleContext[];
    history?: ArticleChatMessage[];
  }): Promise<{ answer: string; model: string; retrievedContext: string[] }> {
    const { question, analysis, articles, history = [] } = input;
    const retrievedContext = articles.flatMap((article) => article.snippets);

    if (articles.length === 0) {
      return {
        answer: this.fallbackNewsAnswer(question, analysis, articles),
        model: "fallback",
        retrievedContext
      };
    }

    const articleBlocks = articles
      .map((item, index) => {
        const snippets =
          item.snippets.length > 0
            ? item.snippets.map((snippet, snippetIndex) => `Snippet ${snippetIndex + 1}: ${snippet}`).join("\n\n")
            : item.context || "No retrieved snippets were available.";

        return [
          `Article ${index + 1}:`,
          `Title: ${item.article.title}`,
          `Source: ${item.article.source.name}`,
          `Published: ${item.article.publishedAt}`,
          `Category: ${item.article.category}`,
          `Relevance: ${item.relevance}%`,
          "Retrieved context:",
          snippets,
          ""
        ].join("\n");
      })
      .join("\n");

    const prompt = [
      `Search query: ${analysis.searchQuery}`,
      `Detected category: ${analysis.category ?? "uncategorized"}`,
      `Detected intent: ${analysis.intent}`,
      `Keywords: ${analysis.keywords.join(", ") || "none"}`,
      `Phrases: ${analysis.phrases.join(", ") || "none"}`,
      "",
      "Conversation history:",
      formatConversation(history) || "No prior messages.",
      "",
      `User question: ${question}`,
      "",
      "Relevant articles:",
      articleBlocks,
      "",
      "Instructions:",
      "Answer the question by synthesizing the supplied articles and retrieved context.",
      "Be detailed and specific, but do not invent facts or add outside context.",
      "If multiple articles agree, say so. If coverage is thin, say what is missing.",
      "Prefer plain, readable prose in four to seven sentences.",
      'Return JSON only in the exact shape: {"answer":"..."}'
    ].join("\n");

    try {
      const tier = articles.length > 2 ? "deep" : "balanced";
      const { model, content } = await this.callModelForTier(tier, prompt, NEWS_ASSISTANT_SYSTEM_PROMPT, {
        maxTokens: 360
      });
      const cleaned = cleanFenceBlocks(content);

      try {
        const parsedJson = JSON.parse(cleaned) as unknown;
        const parsed = answerSchema.safeParse(parsedJson);

        if (parsed.success) {
          return {
            answer: normalizeLine(parsed.data.answer) || this.fallbackNewsAnswer(question, analysis, articles),
            model,
            retrievedContext
          };
        }
      } catch {
        // Fall through to text response.
      }

      return {
        answer: normalizeLine(cleaned) || this.fallbackNewsAnswer(question, analysis, articles),
        model,
        retrievedContext
      };
    } catch {
      return {
        answer: this.fallbackNewsAnswer(question, analysis, articles),
        model: "fallback",
        retrievedContext
      };
    }
  }

  private fallbackChatAnswer(
    article: NewsArticle,
    summary: DistilledSummary,
    question: string,
    contextSnippets: string[]
  ): string {
    const basis = compactText(summary.insight || contextSnippets[0] || article.description || article.title, 160);
    return `My read is that ${basis}. I can’t verify every detail from the available text, but the article points toward that interpretation. If you want, I can also unpack the framing, likely impact, or what feels missing.`;
  }

  private fallbackNewsAnswer(question: string, analysis: NewsQueryAnalysis, articles: NewsAssistantArticleContext[]): string {
    const leadArticle = articles[0];

    if (!leadArticle) {
      return `I could not find a strong match for "${question}". Try adding a person, company, region, or topic so I can search more precisely.`;
    }

    const basis = compactText(
      leadArticle.snippets[0] ?? leadArticle.article.description ?? leadArticle.article.content ?? leadArticle.article.title,
      160
    );

    return `I found ${articles.length} relevant story${articles.length === 1 ? "" : "ies"} for "${analysis.searchQuery}". The strongest match is "${leadArticle.article.title}" from ${leadArticle.article.source.name}, and the article suggests ${basis}. If you want, I can narrow it by region, date, or a named source.`;
  }
}
