import "server-only";

import { getDb } from "@/lib/db";
import { articleReactions } from "@/lib/db/schema";
import { and, eq, inArray, sql } from "drizzle-orm";

import type { ArticleLikeResponse } from "@/types/news";

function hashIp(ip: string): string {
  // Simple hash for privacy — not cryptographic, just for deduplication
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

function normalizeIpAddress(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : "unknown";
}

export function getClientIp(headers: Headers) {
  const forwardedFor = headers.get("x-forwarded-for") ?? headers.get("x-vercel-forwarded-for");
  const forwardedIp = forwardedFor?.split(",")[0]?.trim();
  return normalizeIpAddress(
    forwardedIp ?? headers.get("x-real-ip") ?? headers.get("cf-connecting-ip") ?? headers.get("x-client-ip")
  );
}

async function getReactionCounts(articleIds: string[]): Promise<Map<string, number>> {
  if (articleIds.length === 0) return new Map();

  const db = getDb();
  const results = await db
    .select({
      articleId: articleReactions.articleId,
      count: sql<number>`count(distinct ${articleReactions.ipHash})`
    })
    .from(articleReactions)
    .where(inArray(articleReactions.articleId, articleIds))
    .groupBy(articleReactions.articleId);

  return new Map(results.map((r) => [r.articleId, r.count]));
}

async function getViewerLikedArticles(articleIds: string[], viewerIp: string): Promise<Set<string>> {
  if (articleIds.length === 0 || viewerIp === "unknown") return new Set();

  const db = getDb();
  const ipHash = hashIp(viewerIp);
  const results = await db
    .select({ articleId: articleReactions.articleId })
    .from(articleReactions)
    .where(
      and(
        inArray(articleReactions.articleId, articleIds),
        eq(articleReactions.ipHash, ipHash)
      )
    );

  return new Set(results.map((r) => r.articleId));
}

export async function annotateArticleReactions<T extends { id: string }>(
  articles: T[],
  viewerIp?: string
): Promise<Array<T & Pick<ArticleLikeResponse, "likeCount" | "likedByViewer">>> {
  if (articles.length === 0) return [];

  const articleIds = articles.map((a) => a.id);
  const [counts, likedByViewer] = await Promise.all([
    getReactionCounts(articleIds),
    getViewerLikedArticles(articleIds, viewerIp ?? "unknown")
  ]);

  return articles.map((article) => ({
    ...article,
    likeCount: counts.get(article.id) ?? 0,
    likedByViewer: likedByViewer.has(article.id)
  }));
}

export async function registerArticleLike(articleId: string, viewerIp?: string): Promise<ArticleLikeResponse> {
  const normalizedIp = normalizeIpAddress(viewerIp);
  const ipHash = hashIp(normalizedIp);

  const db = getDb();

  // Insert with conflict handling — unique index on (article_id, ip_hash) prevents duplicates
  await db
    .insert(articleReactions)
    .values({ articleId, ipHash })
    .onConflictDoNothing();

  // Get updated count
  const [result] = await db
    .select({
      count: sql<number>`count(distinct ${articleReactions.ipHash})`
    })
    .from(articleReactions)
    .where(eq(articleReactions.articleId, articleId));

  return {
    articleId,
    likeCount: result?.count ?? 0,
    likedByViewer: true
  };
}
