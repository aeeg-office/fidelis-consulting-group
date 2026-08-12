/**
 * Minimal in-process sliding-window rate limiter for auth/form endpoints.
 * In-memory only (per-instance); a production multi-instance deployment should
 * back this with Redis, but this prevents trivial brute-force/abuse in the
 * single-instance deploy.
 */

interface Bucket {
  timestamps: number[];
}

const buckets = new Map<string, Bucket>();

// Auto-clear idle buckets so the map doesn't grow unbounded.
setInterval(() => {
  const now = Date.now();
  for (const [key, b] of buckets) {
    const live = b.timestamps.filter((t) => now - t < 60_000);
    if (live.length === 0) buckets.delete(key);
    else b.timestamps = live;
  }
}, 60_000).unref?.();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
  remaining: number;
}

/**
 * @param key      unique key (e.g. `login:${email}` or `login:ip:${ip}`)
 * @param limit    max requests in the window
 * @param windowMs sliding window length
 */
export function rateLimit(key: string, limit: number, windowMs = 60_000): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { timestamps: [] };

  // Keep only entries inside the window.
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);

  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0];
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return { allowed: false, retryAfterSeconds, remaining: 0 };
  }

  bucket.timestamps.push(now);
  buckets.set(key, bucket);
  return { allowed: true, remaining: limit - bucket.timestamps.length };
}

/** Test helper to reset state between cases. */
export function _resetRateLimiterForTests(): void {
  buckets.clear();
}
