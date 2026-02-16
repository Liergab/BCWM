import { Request, Response, NextFunction } from 'express';
import redisService from '../config/redis';
import logger from '../config/logger';

/**
 * Cache middleware for GET requests
 * @param ttl - Time to live in seconds (default: 300 = 5 minutes)
 */
export const cacheMiddleware = (ttl: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip if Redis is not connected
    if (!redisService.isReady()) {
      logger.warn('Redis not ready, skipping cache');
      return next();
    }

    // Generate cache key from URL and query params
    const cacheKey = `cache:${req.originalUrl || req.url}`;

    try {
      // Check if cached data exists
      const cachedData = await redisService.get(cacheKey);

      if (cachedData) {
        logger.debug(`Cache HIT for key: ${cacheKey}`);
        const parsed = JSON.parse(cachedData);
        return res.status(200).json(parsed);
      }

      logger.debug(`Cache MISS for key: ${cacheKey}`);

      // Store the original res.json function
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = ((body: any) => {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redisService
            .set(cacheKey, JSON.stringify(body), ttl)
            .then(() => {
              logger.debug(`Cached response for key: ${cacheKey} (TTL: ${ttl}s)`);
            })
            .catch((err) => {
              logger.error(`Failed to cache response for key: ${cacheKey}`, err);
            });
        }

        return originalJson(body);
      }) as any;

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Invalidate cache for specific pattern
 */
export const invalidateCache = async (pattern: string): Promise<void> => {
  try {
    if (!redisService.isReady()) {
      logger.warn('Redis not ready, cannot invalidate cache');
      return;
    }

    const client = redisService.getClient();
    const keys = await client.keys(pattern);

    if (keys.length > 0) {
      await Promise.all(keys.map((key) => redisService.del(key)));
      logger.info(`Invalidated ${keys.length} cache entries for pattern: ${pattern}`);
    }
  } catch (error) {
    logger.error('Cache invalidation error:', error);
  }
};
