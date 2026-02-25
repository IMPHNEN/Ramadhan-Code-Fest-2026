import { redis } from './redis';

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in seconds
}

const WINDOW_SIZE_IN_SECONDS = 60;
const MAX_REQUESTS_PER_WINDOW = 60;

export async function rateLimit(key: string): Promise<RateLimitResult> {
  const now = Math.floor(Date.now() / 1000); // current Unix timestamp in seconds
  const windowStart = now - WINDOW_SIZE_IN_SECONDS;

  try {
    // Remove scores older than the window start
    await redis.zremrangebyscore(key, 0, windowStart);

    // Add current request timestamp
    await redis.zadd(key, { score: now, member: `${now}-${Math.random()}` });

    // Set expiration for the key to avoid stale data
    await redis.expire(key, WINDOW_SIZE_IN_SECONDS + 5); // +5 seconds buffer

    // Get current request count in the window
    const requestCount = await redis.zcard(key);

    const allowed = requestCount <= MAX_REQUESTS_PER_WINDOW;
    const remaining = allowed ? MAX_REQUESTS_PER_WINDOW - requestCount : 0;
    const reset = windowStart + WINDOW_SIZE_IN_SECONDS; // When the current window resets

    return {
      allowed,
      limit: MAX_REQUESTS_PER_WINDOW,
      remaining,
      reset,
    };
  } catch (error) {
    console.error(`Error rate limiting for key ${key}:`, error);
    // In case of Redis error, allow the request but log the error
    return {
      allowed: true,
      limit: MAX_REQUESTS_PER_WINDOW,
      remaining: MAX_REQUESTS_PER_WINDOW,
      reset: now + WINDOW_SIZE_IN_SECONDS,
    };
  }
}
