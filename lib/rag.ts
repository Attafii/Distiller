import "server-only";

import { createHash } from "crypto";

import { LRUCache } from "lru-cache";
import { fetchWithTimeout } from "@/lib/http";
import type { NewsArticle } from "@/types/news";

const embeddingCache = new LRUCache<string, number[]>({
  max: 500,
  ttl: 1000 * 60 * 60
});

export interface RagContext {
  snippets: string[];
  context: string;
  tokenEstimate: number;
  usedEmbeddings: boolean;
}

function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function hashText(text: string) {
  return createHash("sha1").update(text).digest("hex");
}

export function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

export function chunkText(text: string, chunkSize = 900, overlap = 120): string[] {
  const cleaned = normalizeText(text);

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

function cosineSimilarity(left: number[], right: number[]): number {
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  const length = Math.min(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    dot += left[index] * right[index];
    leftMagnitude += left[index] * left[index];
    rightMagnitude += right[index] * right[index];
  }

  if (!leftMagnitude || !rightMagnitude) {
    return 0;
  }

  return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
}

function lexicalScore(chunk: string, query: string): number {
  const queryTerms = normalizeText(query)
    .toLowerCase()
    .split(/\W+/)
    .filter((term) => term.length > 4);

  if (!queryTerms.length) {
    return 0;
  }

  const haystack = chunk.toLowerCase();
  const hits = queryTerms.filter((term) => haystack.includes(term)).length;
  return hits / queryTerms.length;
}

function rankLexically(chunks: string[], query: string, maxChunks: number): string[] {
  return chunks
    .map((chunk, index) => ({
      chunk,
      score: lexicalScore(chunk, query) + (index === 0 ? 0.05 : 0)
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, maxChunks)
    .map((entry) => entry.chunk);
}

function formatContext(snippets: string[]): string {
  return snippets.map((snippet, index) => `Snippet ${index + 1}: ${snippet}`).join("\n\n");
}

async function embedText(text: string): Promise<number[]> {
  const cacheKey = hashText(text);
  const cached = embeddingCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const baseUrl = (process.env.NVIDIA_BUILD_BASE_URL ?? "https://integrate.api.nvidia.com/v1").replace(/\/$/, "");
  const apiKey = process.env.NVIDIA_BUILD_API_KEY;
  const embeddingModel = process.env.NVIDIA_BUILD_EMBED_MODEL ?? "nvidia/nv-embedqa-e5-v5";

  if (!apiKey) {
    throw new Error("Missing NVIDIA_BUILD_API_KEY");
  }

  const response = await fetchWithTimeout(`${baseUrl}/embeddings`, {
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
  }, 5000);

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

async function rankWithEmbeddings(chunks: string[], query: string, maxChunks: number): Promise<string[]> {
  const [queryEmbedding, ...chunkEmbeddings] = await Promise.all([
    embedText(query),
    ...chunks.map((chunk) => embedText(chunk))
  ]);

  return chunks
    .map((chunk, index) => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, chunkEmbeddings[index] ?? []) + lexicalScore(chunk, query) * 0.25
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, maxChunks)
    .map((entry) => entry.chunk);
}

export async function buildRagContext(
  article: Pick<NewsArticle, "title" | "description" | "content">,
  query?: string,
  maxChunks = 3
): Promise<RagContext> {
  const sourceText = normalizeText([article.title, article.description, article.content].filter(Boolean).join("\n\n"));

  if (!sourceText) {
    return {
      snippets: [],
      context: "",
      tokenEstimate: 0,
      usedEmbeddings: false
    };
  }

  const tokenEstimate = estimateTokens(sourceText);
  if (tokenEstimate <= 220) {
    return {
      snippets: [sourceText],
      context: sourceText,
      tokenEstimate,
      usedEmbeddings: false
    };
  }

  const chunks = chunkText(sourceText);
  const queryText = normalizeText(query ?? article.title);

  if (!chunks.length) {
    return {
      snippets: [sourceText],
      context: sourceText,
      tokenEstimate,
      usedEmbeddings: false
    };
  }

  try {
    const snippets = await rankWithEmbeddings(chunks, queryText, maxChunks);
    return {
      snippets,
      context: formatContext(snippets),
      tokenEstimate: snippets.reduce((sum, snippet) => sum + estimateTokens(snippet), 0),
      usedEmbeddings: true
    };
  } catch {
    const snippets = rankLexically(chunks, queryText, maxChunks);
    return {
      snippets,
      context: formatContext(snippets),
      tokenEstimate: snippets.reduce((sum, snippet) => sum + estimateTokens(snippet), 0),
      usedEmbeddings: false
    };
  }
}
