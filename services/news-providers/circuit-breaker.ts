import "server-only";

type BreakerState = "closed" | "open" | "half-open";

interface BreakerEntry {
  state: BreakerState;
  failures: number;
  openedAt: number;
  cooldownMs: number;
}

const DEFAULT_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
const MAX_FAILURES = 3;

const breakers = new Map<string, BreakerEntry>();

function getBreaker(providerId: string): BreakerEntry {
  let entry = breakers.get(providerId);
  if (!entry) {
    entry = { state: "closed", failures: 0, openedAt: 0, cooldownMs: DEFAULT_COOLDOWN_MS };
    breakers.set(providerId, entry);
  }
  return entry;
}

export function isProviderAvailable(providerId: string): boolean {
  const entry = getBreaker(providerId);

  if (entry.state === "closed") return true;

  if (entry.state === "open") {
    // Check if cooldown has elapsed → transition to half-open
    if (Date.now() - entry.openedAt > entry.cooldownMs) {
      entry.state = "half-open";
      return true;
    }
    return false;
  }

  // half-open → allow one probe
  return true;
}

export function recordSuccess(providerId: string): void {
  const entry = getBreaker(providerId);
  entry.failures = 0;
  entry.state = "closed";
}

export function recordFailure(providerId: string, isQuotaExhausted = false): void {
  const entry = getBreaker(providerId);
  entry.failures += 1;

  // Quota exhaustion → open immediately with longer cooldown
  if (isQuotaExhausted) {
    entry.state = "open";
    entry.openedAt = Date.now();
    entry.cooldownMs = 30 * 60 * 1000; // 30 min for quota errors
    return;
  }

  // Trip after MAX_FAILURES consecutive failures
  if (entry.failures >= MAX_FAILURES) {
    entry.state = "open";
    entry.openedAt = Date.now();
    entry.cooldownMs = DEFAULT_COOLDOWN_MS;
  }
}

export function isQuotaError(statusCode: number, body?: string): boolean {
  // 402 = TheNewsAPI daily quota
  // 403 = GNews daily quota
  // 429 = standard rate limit
  if (statusCode === 402 || statusCode === 403 || statusCode === 429) return true;

  // Check body for quota signals
  if (body) {
    const lower = body.toLowerCase();
    if (
      lower.includes("ratelimited") ||
      lower.includes("rate_limit_reached") ||
      lower.includes("usage_limit_reached") ||
      lower.includes("daily quota") ||
      lower.includes("request limit")
    ) {
      return true;
    }
  }

  return false;
}
