import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { normalizeEnvString } from "@/lib/utils";

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 30;

let ratelimit: Ratelimit | null = null;
let inMemoryStore: Map<string, { count: number; resetAt: number }> | null = null;

function getInMemoryStore(): Map<string, { count: number; resetAt: number }> {
  if (!inMemoryStore) {
    inMemoryStore = new Map();
  }
  return inMemoryStore;
}

function initUpstashRatelimit(): Ratelimit | null {
  const redisUrl = normalizeEnvString(process.env.UPSTASH_REDIS_REST_URL);
  const redisToken = normalizeEnvString(process.env.UPSTASH_REDIS_REST_TOKEN);

  if (!redisUrl || !redisToken) {
    return null;
  }

  const redis = new Redis({ url: redisUrl, token: redisToken });

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(MAX_REQUESTS, `${WINDOW_MS / 1000}s`),
    analytics: true,
    prefix: "distiller_ratelimit"
  });
}

function getRatelimit(): Ratelimit | null {
  if (!ratelimit) {
    ratelimit = initUpstashRatelimit();
  }
  return ratelimit;
}

export function getRateLimitKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0]?.trim() ?? cfConnectingIp ?? realIp ?? "anonymous";
  return ip.replace(/:/g, "_");
}

export async function checkRateLimit(request: Request): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const key = getRateLimitKey(request);
  const rl = getRatelimit();

  if (rl) {
    const result = await rl.limit(key);
    return {
      allowed: result.success,
      remaining: result.remaining,
      resetIn: result.reset * 1000 - Date.now()
    };
  }

  const now = Date.now();
  const store = getInMemoryStore();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetIn: WINDOW_MS };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, remaining: MAX_REQUESTS - entry.count, resetIn: entry.resetAt - now };
}