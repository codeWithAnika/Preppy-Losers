/**
 * In-memory sliding-window rate limiter for Edge middleware.
 *
 * Note: Each serverless isolate maintains its own store. For multi-region
 * production at scale, use Upstash Redis (@upstash/ratelimit).
 * This provides baseline protection for single-instance and dev deployments.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  /** Max requests per window */
  limit: number;
  /** Window size in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

function getStore(namespace: string): Map<string, RateLimitEntry> {
  let store = stores.get(namespace);
  if (!store) {
    store = new Map();
    stores.set(namespace, store);
  }
  return store;
}

export function rateLimit(
  key: string,
  config: RateLimitConfig,
  namespace = "default"
): RateLimitResult {
  const store = getStore(namespace);
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || now >= existing.resetAt) {
    const resetAt = now + config.windowMs;
    store.set(key, { count: 1, resetAt });
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetAt,
    };
  }

  if (existing.count >= config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  existing.count += 1;
  store.set(key, existing);

  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - existing.count,
    resetAt: existing.resetAt,
  };
}

/** General API / site traffic: 100 requests per minute per IP. */
export const GENERAL_RATE_LIMIT: RateLimitConfig = {
  limit: 100,
  windowMs: 60_000,
};

/** Auth entry pages: 30 navigations per 15 minutes per IP (excludes RSC/prefetch). */
export const AUTH_RATE_LIMIT: RateLimitConfig = {
  limit: 30,
  windowMs: 15 * 60_000,
};

function anonymousClientKey(request: Request): string {
  const ua = request.headers.get("user-agent") ?? "no-ua";
  const lang = request.headers.get("accept-language") ?? "no-lang";
  let hash = 2166136261;

  for (const char of `${ua}|${lang}`) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return `anon:${(hash >>> 0).toString(16)}`;
}

export function getClientIp(request: Request & { ip?: string | null }): string {
  const directIp = request.ip?.trim();
  if (directIp) {
    return directIp;
  }

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  const cfIp = request.headers.get("cf-connecting-ip")?.trim();
  if (cfIp) {
    return cfIp;
  }

  return anonymousClientKey(request);
}

export function applyRateLimitHeaders(
  headers: Headers,
  result: RateLimitResult
): void {
  headers.set("X-RateLimit-Limit", String(result.limit));
  headers.set("X-RateLimit-Remaining", String(result.remaining));
  headers.set(
    "X-RateLimit-Reset",
    String(Math.ceil(result.resetAt / 1000))
  );
}
