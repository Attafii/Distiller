import "server-only";

import { promises as fs } from "fs";
import path from "path";

import type { ArticleLikeResponse } from "@/types/news";

type ReactionStore = Record<string, { ips: string[] }>;

const DATA_DIRECTORY = path.join(process.cwd(), ".distiller-data");
const STORE_PATH = path.join(DATA_DIRECTORY, "article-reactions.json");

let reactionQueue = Promise.resolve();

function withReactionLock<T>(task: () => Promise<T>): Promise<T> {
  const run = reactionQueue.then(task, task);
  reactionQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
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

async function readReactionStore(): Promise<ReactionStore> {
  try {
    const content = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(content) as unknown;

    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    return Object.entries(parsed as Record<string, unknown>).reduce<ReactionStore>((store, [articleId, value]) => {
      const ips = Array.isArray((value as { ips?: unknown } | undefined)?.ips)
        ? ((value as { ips?: unknown }).ips as unknown[])
            .filter((ip): ip is string => typeof ip === "string" && ip.trim().length > 0)
            .map((ip) => ip.trim())
        : [];

      store[articleId] = { ips };
      return store;
    }, {});
  } catch (error) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === "ENOENT") {
      return {};
    }

    console.warn("Unable to read article reaction store", error);
    return {};
  }
}

async function writeReactionStore(store: ReactionStore) {
  await fs.mkdir(DATA_DIRECTORY, { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

function getReactionSnapshot(store: ReactionStore, articleId: string, viewerIp?: string): ArticleLikeResponse {
  const ips = store[articleId]?.ips ?? [];

  return {
    articleId,
    likeCount: ips.length,
    likedByViewer: Boolean(viewerIp && ips.includes(viewerIp))
  };
}

export async function annotateArticleReactions<T extends { id: string }>(
  articles: T[],
  viewerIp?: string
): Promise<Array<T & Pick<ArticleLikeResponse, "likeCount" | "likedByViewer">>> {
  const store = await readReactionStore();

  return articles.map((article) => {
    const { articleId: _articleId, ...reactionFields } = getReactionSnapshot(store, article.id, viewerIp);

    return {
      ...article,
      ...reactionFields
    };
  });
}

export async function registerArticleLike(articleId: string, viewerIp?: string): Promise<ArticleLikeResponse> {
  const normalizedIp = normalizeIpAddress(viewerIp);

  return withReactionLock(async () => {
    const store = await readReactionStore();
    const existing = store[articleId]?.ips ?? [];

    if (!existing.includes(normalizedIp)) {
      store[articleId] = { ips: [...existing, normalizedIp] };
      await writeReactionStore(store);
    }

    return getReactionSnapshot(store, articleId, normalizedIp);
  });
}