import { Redis } from "@upstash/redis";
import { normalizeEnvString } from "@/lib/utils";

export const PLAN_LIMITS = {
  free: {
    articlesPerMonth: 50,
    topics: 2,
    regions: 2,
    label: "50 articles / month",
    bookmarks: false,
    deepSummary: false,
    rss: false,
    emailBriefing: false,
    priceMonthly: 0,
    priceAnnual: 0,
    trialDays: 0
  },
  guest: {
    articlesPerDay: 50,
    allowedTopics: ["world", "tech"] as const,
    label: "50 articles / day"
  },
  pro: {
    articlesPerMonth: Infinity,
    topics: 15,
    regions: 15,
    label: "Unlimited",
    bookmarks: true,
    deepSummary: true,
    rss: true,
    emailBriefing: true,
    priceMonthly: 9,
    priceAnnual: 86.4,
    trialDays: 7
  },
  team: {
    articlesPerMonth: Infinity,
    topics: 15,
    regions: 15,
    label: "Unlimited",
    bookmarks: true,
    deepSummary: true,
    rss: true,
    emailBriefing: true,
    seats: 5,
    teamFeed: true,
    analytics: true,
    priceMonthly: 29,
    priceAnnual: 278.4,
    trialDays: 7
  },
  api: {
    articlesPerMonth: 1000,
    label: "1,000 articles included",
    apiAccess: true,
    pricePerArticle: 0.003
  }
} as const;

export const FREE_MONTHLY_ARTICLE_LIMIT = PLAN_LIMITS.free.articlesPerMonth;

const GUEST_TTL_SECONDS = 24 * 60 * 60;

// ponytail: in-memory fallback when Upstash env vars are missing
const guestViewCounts = new Map<string, { count: number; dateStr: string }>();

let redisClient: Redis | null = null;

function getRedis(): Redis | null {
  if (!redisClient) {
    const url = normalizeEnvString(process.env.UPSTASH_REDIS_REST_URL);
    const token = normalizeEnvString(process.env.UPSTASH_REDIS_REST_TOKEN);
    if (url && token) {
      redisClient = new Redis({ url, token });
    }
  }
  return redisClient;
}

function guestKey(ip: string): string {
  return `distiller_guest:${ip}`;
}

function getGuestCountInMemory(ip: string): number {
  const today = new Date().toISOString().split("T")[0];
  const entry = guestViewCounts.get(ip);
  if (!entry || entry.dateStr !== today) {
    guestViewCounts.set(ip, { count: 0, dateStr: today });
    return 0;
  }
  return entry.count;
}

export async function checkGuestFeedAccess(ip: string): Promise<{ ok: boolean; remaining: number }> {
  const limit = PLAN_LIMITS.guest.articlesPerDay;
  const redis = getRedis();

  if (redis) {
    const count = await redis.get<number>(guestKey(ip));
    const current = count ?? 0;
    if (current >= limit) {
      return { ok: false, remaining: 0 };
    }
    return { ok: true, remaining: limit - current };
  }

  const count = getGuestCountInMemory(ip);
  if (count >= limit) {
    return { ok: false, remaining: 0 };
  }
  return { ok: true, remaining: limit - count };
}

export async function incrementGuestCount(ip: string): Promise<number> {
  const redis = getRedis();

  if (redis) {
    const key = guestKey(ip);
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, GUEST_TTL_SECONDS);
    }
    return count;
  }

  const today = new Date().toISOString().split("T")[0];
  const entry = guestViewCounts.get(ip);
  if (!entry || entry.dateStr !== today) {
    guestViewCounts.set(ip, { count: 1, dateStr: today });
    return 1;
  }
  entry.count += 1;
  return entry.count;
}

export const GUEST_ALLOWED_TOPICS: Array<"world" | "tech"> = [...PLAN_LIMITS.guest.allowedTopics];