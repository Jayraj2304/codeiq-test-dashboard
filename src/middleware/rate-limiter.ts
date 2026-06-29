import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimiterOptions {
  windowMs: number;
  max: number;
  keyGenerator?: (req: Request) => string;
  message?: string;
  onLimitReached?: (key: string) => void;
}

export function rateLimiter(options: RateLimiterOptions) {
  const {
    windowMs = 60 * 1000,
    max = 100,
    keyGenerator = (req) => req.ip || 'unknown',
    message = 'Too many requests, please try again later',
    onLimitReached,
  } = options;

  const store = new Map<string, RateLimitEntry>();
  let cleanupInterval: NodeJS.Timeout | null = null;

  function startCleanup() {
    if (cleanupInterval) return;
    cleanupInterval = setInterval(() => {
      const now = Date.now();
      let cleaned = 0;
      for (const [key, entry] of store) {
        if (now > entry.resetAt) {
          store.delete(key);
          cleaned++;
        }
      }
      if (cleaned > 0) {
        logger.debug(`Rate limiter cleanup: removed ${cleaned} expired entries`);
      }
    }, windowMs);
    cleanupInterval.unref();
  }

  startCleanup();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();

    let entry = store.get(key);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      store.set(key, entry);
    }

    entry.count++;

    const remaining = Math.max(0, max - entry.count);
    const resetSeconds = Math.ceil((entry.resetAt - now) / 1000);

    res.set('X-RateLimit-Limit', max.toString());
    res.set('X-RateLimit-Remaining', remaining.toString());
    res.set('X-RateLimit-Reset', Math.ceil(entry.resetAt / 1000).toString());
    res.set('Retry-After', resetSeconds.toString());

    if (entry.count > max) {
      logger.warn(`Rate limit exceeded for ${key}: ${entry.count}/${max}`);
      onLimitReached?.(key);
      return res.status(429).json({ error: message });
    }

    next();
  };
}

export function createRateLimiter(options: RateLimiterOptions) {
  return rateLimiter(options);
}

export function cleanupStore(store: Map<string, RateLimitEntry>) {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}
