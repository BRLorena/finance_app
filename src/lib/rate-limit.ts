/**
 * Simple in-memory rate limiter for API routes
 * Helps reduce Vercel CPU usage by preventing excessive requests
 */

type RateLimitEntry = {
  count: number
  resetTime: number
}

// In-memory store (works per-instance, good for serverless)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up old entries periodically
const CLEANUP_INTERVAL = 60000 // 1 minute
let lastCleanup = Date.now()

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  
  lastCleanup = now
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}

export type RateLimitConfig = {
  /** Maximum number of requests allowed in the time window */
  maxRequests: number
  /** Time window in seconds */
  windowSeconds: number
}

export type RateLimitResult = {
  success: boolean
  remaining: number
  resetIn: number // seconds until reset
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (usually user ID or IP)
 * @param endpoint - API endpoint name for granular limits
 * @param config - Rate limit configuration
 */
export function rateLimit(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig
): RateLimitResult {
  cleanup()
  
  const key = `${identifier}:${endpoint}`
  const now = Date.now()
  const windowMs = config.windowSeconds * 1000
  
  const entry = rateLimitStore.get(key)
  
  if (!entry || entry.resetTime < now) {
    // First request or window expired - create new entry
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    })
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowSeconds,
    }
  }
  
  // Within the time window
  if (entry.count >= config.maxRequests) {
    // Rate limited
    return {
      success: false,
      remaining: 0,
      resetIn: Math.ceil((entry.resetTime - now) / 1000),
    }
  }
  
  // Increment counter
  entry.count++
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetIn: Math.ceil((entry.resetTime - now) / 1000),
  }
}

/**
 * Predefined rate limit configurations
 */
export const RATE_LIMITS = {
  // Standard API endpoints - 60 requests per minute
  standard: { maxRequests: 60, windowSeconds: 60 },
  
  // AI endpoints - 10 requests per minute (expensive)
  ai: { maxRequests: 10, windowSeconds: 60 },
  
  // Auth endpoints - 10 requests per minute (prevent brute force)
  auth: { maxRequests: 10, windowSeconds: 60 },
  
  // Heavy endpoints like summary - 30 requests per minute
  heavy: { maxRequests: 30, windowSeconds: 60 },
} as const

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult, config: RateLimitConfig) {
  return {
    'X-RateLimit-Limit': config.maxRequests.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetIn.toString(),
  }
}
