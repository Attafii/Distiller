import { db } from "@/db";
import { articles } from "@/db/schema";
import { TOPICS } from "@/lib/constants";
import { truncate } from "@/lib/format";
import { desc } from "drizzle-orm";

export type SourceSnippet = {
  articleId: number;
  title: string;
  source: string;
  sourceUrl: string;
  snippet: string;
  score: number;
};

export type AnswerResult = {
  answer: string;
  bullets: string[];
  keyInsight: string;
  headline: string;
  sources: SourceSnippet[];
  topicIntent: string | null;
};

const STOPWORDS = new Set(
  `a an and are as at be but by for from had has have he her his i in is it its
   of on or our she so that the their them they this to was we were what when
   where which who will with you your news about week today latest happened
   whats what's tell report reports reported says said how why much many most
   please can you more out up than then into just also`.split(/\s+/)
);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/['’]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
    .map((t) => (t.length > 5 ? t.replace(/ing$|tion$|ments?$|ly$|es$|s$/, "") : t));
}

function chunkText(text: string, target = 900): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if (current.length + sentence.length > target && current.length > 0) {
      chunks.push(current.trim());
      current = "";
    }
    current += sentence + " ";
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

function buildVectors(docs: string[]): Map<string, number>[] {
  // document frequency
  const df = new Map<string, number>();
  for (const doc of docs) {
    for (const term of new Set(tokenize(doc))) {
      df.set(term, (df.get(term) ?? 0) + 1);
    }
  }
  const N = docs.length;
  const vectors: Map<string, number>[] = docs.map((doc) => {
    const tf = new Map<string, number>();
    for (const t of tokenize(doc)) tf.set(t, (tf.get(t) ?? 0) + 1);
    const vec = new Map<string, number>();
    for (const [term, freq] of tf) {
      const idf = Math.log((N + 1) / ((df.get(term) ?? 0) + 1)) + 1;
      vec.set(term, (1 + Math.log(freq)) * idf);
    }
    return vec;
  });
  // l2 normalize
  for (const vec of vectors) {
    let norm = 0;
    for (const v of vec.values()) norm += v * v;
    norm = Math.sqrt(norm) || 1;
    for (const [k, v] of vec) vec.set(k, v / norm);
  }
  return vectors;
}

function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  const [small, large] = a.size < b.size ? [a, b] : [b, a];
  for (const [term, w] of small) {
    const other = large.get(term);
    if (other) dot += w * other;
  }
  return dot;
}

function detectTopicIntent(question: string): string | null {
  const q = question.toLowerCase();
  const aliases: Record<string, string[]> = {
    AI: ["ai ", " ai", "artificial intelligence", "agent", "model"],
    LLM: ["llm", "language model"],
    Climate: ["climate", "emission", "carbon", "methane", "renewable", "solar"],
    Finance: ["finance", "rate", "inflation", "central bank", "treasury", "token"],
    Stocks: ["stock", "market", "shares", "index", "ev ", "investor", "trading"],
    Health: ["health", "vaccine", "alzheimer", "disease", "medical", "drug"],
    Science: ["science", "research", "study", "discovery", "space", "moon", "quantum"],
    Sports: ["sport", "football", "marathon", "record", "match", "tournament"],
    Entertainment: ["movie", "film", "streaming", "tv ", "series", "festival"],
    Technology: ["tech", "chip", "foundry", "hardware", "semiconductor"],
    Politics: ["politics", "election", "diplomacy", "policy", "vote"],
    Business: ["business", "cloud", "supply chain", "export", "revenue"],
    World: ["world", "rail", "coastal", "trade"],
    Culture: ["culture", "museum", "art "],
    Education: ["education", "learning", "school"],
  };
  for (const topic of TOPICS) {
    const keys = aliases[topic] ?? [];
    for (const key of keys) {
      if (q.includes(key)) return topic;
    }
  }
  return null;
}

function pickSentence(snippet: string, queryVec: Map<string, number>): string {
  const sentences = snippet.match(/[^.!?]+[.!?]+/g) ?? [];
  let best = sentences[0] ?? snippet;
  let bestScore = -1;
  for (const s of sentences) {
    const vec = new Map<string, number>();
    for (const t of tokenize(s)) vec.set(t, 1);
    const score = cosine(vec, queryVec);
    if (score > bestScore) {
      bestScore = score;
      best = s;
    }
  }
  return best.trim();
}

export async function askTheNews(question: string): Promise<AnswerResult | null> {
  const rows = await db
    .select()
    .from(articles)
    .orderBy(desc(articles.publishedAt))
    .limit(200);

  if (rows.length === 0) return null;

  const topicIntent = detectTopicIntent(question);
  const weekAgo = Date.now() - 7 * 86400_000;
  const weekRows = rows.filter(
    (a) => a.publishedAt.getTime() >= weekAgo
  );

  // Build per-article corpus: weighted title + chunks of ~900 chars.
  const docMeta: { articleId: number; kind: "title" | "chunk"; chunkIndex: number }[] = [];
  const docs: string[] = [];
  const articleOrder = [...rows];
  const docsForArticle = new Map<number, number[]>();

  for (const article of articleOrder) {
    const title = `${article.title}. ${article.title}`; // weight title 2x
    docMeta.push({ articleId: article.id, kind: "title", chunkIndex: -1 });
    docsForArticle.set(article.id, [docs.length]);
    docs.push(title);
    for (const chunk of chunkText(article.excerpt)) {
      docMeta.push({ articleId: article.id, kind: "chunk", chunkIndex: docsForArticle.get(article.id)!.length });
      docsForArticle.get(article.id)!.push(docs.length);
      docs.push(chunk);
    }
  }

  const vectors = buildVectors(docs);

  const qVec = new Map<string, number>();
  for (const t of tokenize(question)) qVec.set(t, (qVec.get(t) ?? 0) + 1);
  let qNorm = 0;
  for (const v of qVec.values()) qNorm += v * v;
  qNorm = Math.sqrt(qNorm) || 1;
  for (const [k, v] of qVec) qVec.set(k, v / qNorm);

  type Scored = { article: (typeof rows)[number]; score: number };
  const scored: Scored[] = rows.map((article) => {
    const docIdx = docsForArticle.get(article.id) ?? [];
    let best = 0;
    for (const i of docIdx) best = Math.max(best, cosine(vectors[i], qVec));
    if (topicIntent && article.topic === topicIntent) best += 0.35;
    if (topicIntent && article.topic === topicIntent && weekRows.includes(article)) {
      best += 0.2;
    }
    return { article, score: best };
  });

  const ranked = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (ranked.length === 0) {
    return {
      answer:
        "I couldn't find enough coverage in today's briefs to answer that question. Try asking about AI, climate, finance, sports, science, or another topic in the feed.",
      bullets: [],
      keyInsight: "",
      headline: "No grounded answer found",
      sources: [],
      topicIntent,
    };
  }

  const top = ranked[0].article;
  const runnerUp = ranked[1];

  // Ground the answer: the best sentence from each of the top chunks.
  const answerParts: string[] = [];
  const snippetSources: SourceSnippet[] = [];

  for (const { article, score } of ranked.slice(0, 3)) {
    const docIdx = docsForArticle.get(article.id) ?? [];
    let bestChunkIdx = -1;
    let bestChunkScore = -1;
    for (const i of docIdx) {
      if (docMeta[i].kind !== "chunk") continue;
      const s = cosine(vectors[i], qVec);
      if (s > bestChunkScore) {
        bestChunkScore = s;
        bestChunkIdx = i;
      }
    }
    if (bestChunkIdx < 0) continue;
    const chunk = docs[bestChunkIdx];
    const sentence = pickSentence(chunk, qVec);
    if (snippetSources.length === 0 && !answerParts.length) {
      answerParts.push(`According to ${article.source}, ${article.title.replace(/\.$/, "")}. ${sentence}`);
    } else if (snippetSources.length === 1) {
      answerParts.push(`Related coverage from ${article.source}: ${sentence}`);
    }
    snippetSources.push({
      articleId: article.id,
      title: article.title,
      source: article.source,
      sourceUrl: article.sourceUrl,
      snippet: truncate(chunk, 380),
      score: Math.round(score * 1000) / 1000,
    });
  }

  const answer = [
    answerParts.join(" "),
    `${top.bullets[1] ?? ""}`,
  ]
    .filter(Boolean)
    .join(" ");

  const final: AnswerResult = {
    answer: answer.trim(),
    bullets: top.bullets,
    keyInsight: top.keyInsight,
    headline: `${topicIntent ? topicIntent + " briefing" : "Briefing"} — ${top.title}`,
    sources: snippetSources,
    topicIntent,
  };

  if (runnerUp && final.answer.length < 600) {
    final.answer += ` Also of note from ${runnerUp.article.source}: ${runnerUp.article.title.replace(/\.$/, "")}.`;
  }
  return final;
}
