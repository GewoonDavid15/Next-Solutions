import "server-only";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** Drops buckets that have expired, so the map cannot grow without bound. */
function sweep(now: number) {
  if (buckets.size < 500) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the caller may try again. */
  retryAfter: number;
  remaining: number;
}

/**
 * Fixed-window rate limit, held in memory.
 *
 * Good enough to stop one visitor from hammering a form: it blocks the obvious
 * abuse without any extra infrastructure. It is per server instance, so on a
 * platform that runs several instances the effective limit is higher. Move this
 * to Redis or Vercel KV if you need a hard guarantee across instances.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0, remaining: limit - 1 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { allowed: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000), remaining: 0 };
  }
  return { allowed: true, retryAfter: 0, remaining: limit - bucket.count };
}

/**
 * Best-effort client address. Behind Vercel and most proxies the left-most
 * entry of x-forwarded-for is the visitor; it is spoofable in general, so this
 * is for throttling only and never for authorisation.
 */
export function clientKey(headers: Headers, scope: string): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || headers.get("x-real-ip") || "unknown";
  return `${scope}:${ip}`;
}
