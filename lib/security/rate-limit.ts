/**
 * Best-effort in-memory rate limiter for serverless / Node runtimes.
 * Limits are per process instance (not global across Vercel isolates).
 */

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  retryAfterSec: number
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now()
  let bucket = buckets.get(key)

  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + windowMs }
    buckets.set(key, bucket)
  }

  bucket.count += 1

  if (bucket.count > limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    }
  }

  return {
    allowed: true,
    remaining: Math.max(0, limit - bucket.count),
    retryAfterSec: 0,
  }
}

/** Prefer real client IP headers; fall back to a shared anonymous key. */
export function clientIpFromHeaders(headers: Headers | { get(name: string): string | null }): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return headers.get('x-real-ip') || headers.get('cf-connecting-ip') || 'unknown'
}
