import { NextRequest } from 'next/server'

// ============================================================
// In-memory rate limiter — no external dependencies
// ============================================================

interface RateLimitEntry {
  count: number
  resetTime: number
}

const store = new Map<string, RateLimitEntry>()

// Auto-cleanup every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000
let lastCleanup = Date.now()

function cleanup(): void {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  for (const [key, entry] of store) {
    if (now >= entry.resetTime) {
      store.delete(key)
    }
  }
}

/**
 * Check rate limit for a given request and bucket.
 * @returns `{ success, remaining }` — if success is false, the request should be rejected with 429.
 */
export function rateLimit(
  request: NextRequest,
  bucket: string,
  maxRequests: number,
  windowSeconds: number
): { success: boolean; remaining: number } {
  cleanup()

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'

  const key = `${ip}:${bucket}`
  const now = Date.now()
  const windowMs = windowSeconds * 1000

  const entry = store.get(key)

  if (!entry || now >= entry.resetTime) {
    // New window
    store.set(key, { count: 1, resetTime: now + windowMs })
    return { success: true, remaining: maxRequests - 1 }
  }

  if (entry.count >= maxRequests) {
    return { success: false, remaining: 0 }
  }

  entry.count++
  return { success: true, remaining: maxRequests - entry.count }
}
