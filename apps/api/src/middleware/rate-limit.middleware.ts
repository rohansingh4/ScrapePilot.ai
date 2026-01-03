import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { getRedisClient } from '@scrapepilot/database';

const WINDOW_MS = 60 * 1000; // 1 minute

/**
 * Rate limiting middleware using Redis
 * Limits requests per minute based on user's rateLimit setting
 */
export const rateLimitMiddleware = createMiddleware(async (c, next) => {
  const user = c.get('user');

  if (!user) {
    throw new HTTPException(401, { message: 'Unauthorized' });
  }

  const redis = getRedisClient();
  const key = `ratelimit:${user._id}`;
  const limit = user.rateLimit || 10;

  try {
    const current = await redis.incr(key);

    if (current === 1) {
      // Set expiry on first request
      await redis.pexpire(key, WINDOW_MS);
    }

    // Get remaining TTL
    const ttl = await redis.pttl(key);

    // Set rate limit headers
    c.header('X-RateLimit-Limit', String(limit));
    c.header('X-RateLimit-Remaining', String(Math.max(0, limit - current)));
    c.header('X-RateLimit-Reset', String(Math.ceil(Date.now() + ttl)));

    if (current > limit) {
      throw new HTTPException(429, {
        message: `Rate limit exceeded. Try again in ${Math.ceil(ttl / 1000)} seconds.`,
      });
    }

    await next();
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    // If Redis fails, allow the request but log the error
    console.error('Rate limit check failed:', error);
    await next();
  }
});
