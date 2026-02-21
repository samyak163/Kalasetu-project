/**
 * @file cacheMiddleware.js — Redis Response Caching Layer
 *
 * Provides two middleware functions for caching GET responses in Upstash Redis
 * and invalidating cached data on mutations (POST, PUT, DELETE).
 *
 * Caching strategy:
 *  - cache()           — On GET: check Redis for a cached response. If found, return
 *                        it immediately (short-circuits the controller). If not found,
 *                        monkey-patch res.json() to store the response in Redis after
 *                        the controller runs.
 *  - invalidateCache() — On mutations: delete specified cache keys/patterns so the
 *                        next GET fetches fresh data from the database.
 *
 * Cache key format: `cache:{prefix}:{path}?{sorted query params}`
 *   Example: `cache:artisans:/api/artisans?city=mumbai&sort=rating`
 *
 * Fail-safe: Any Redis error is silently caught — the request falls through to
 * the database. Caching is an optimization, never a requirement.
 *
 * @exports {Function} cache           — GET response caching middleware factory
 * @exports {Function} invalidateCache — Cache invalidation middleware factory
 *
 * @requires ../utils/redis.js — getCache, setCache, deleteCache, deleteCachePattern
 * @requires ../config/env.config.js — CACHE_CONFIG (enabled, TTL)
 *
 * @see utils/redis.js — Upstash Redis client and cache operations
 * @see config/env.config.js — CACHE_CONFIG (enabled flag, default TTL)
 */

import { getCache, setCache, deleteCache, deleteCachePattern } from '../utils/redis.js';
import { CACHE_CONFIG } from '../config/env.config.js';

/**
 * GET response caching middleware.
 * Builds a unique cache key from the request path + sorted query params.
 * Returns cached data with { cached: true } flag if found.
 *
 * @param {string} keyPrefix — Namespace prefix (e.g., 'artisans', 'categories')
 * @param {number} ttl       — Time-to-live in seconds (default from CACHE_CONFIG)
 * @returns {Function} Express middleware
 *
 * @example
 *   router.get('/artisans', cache('artisans:list', 600), getArtisans)
 */
export const cache = (keyPrefix = '', ttl = CACHE_CONFIG.upstash?.ttl || CACHE_CONFIG.ttl || 300) => {
  return async (req, res, next) => {
    try {
      if (!CACHE_CONFIG?.enabled) return next();

      // Build a unique cache key using path + query params
      const queryKey = Object.keys(req.query)
        .sort()
        .map((k) => `${k}=${req.query[k]}`)
        .join('&');

      const key = `cache:${keyPrefix}:${req.path}${queryKey ? '?' + queryKey : ''}`;

      const cached = await getCache(key);
      if (cached) {
        return res.status(200).json({ cached: true, data: cached });
      }

      // Monkey-patch res.json to set cache after response
      // Must stay synchronous — async res.json breaks Express response chaining
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300 && body) {
          const payload = body?.data ?? body;
          setCache(key, payload, ttl).catch(() => {}); // fire-and-forget
        }
        return originalJson(body);
      };

      return next();
    } catch (err) {
      // On any cache error, just proceed to handler
      return next();
    }
  };
};

/**
 * Cache invalidation middleware for mutation routes.
 * Deletes specific keys or wildcard patterns from Redis before the handler runs,
 * ensuring the next GET fetches fresh data.
 *
 * Supports glob patterns: keys ending with '*' use deleteCachePattern (SCAN + DEL).
 * Exact keys use deleteCache (single DEL).
 *
 * @param {string[]} keysOrPatterns — Cache keys or glob patterns to invalidate
 * @returns {Function} Express middleware
 *
 * @example
 *   router.put('/artisan/profile', invalidateCache(['cache:artisans:list*', 'cache:artisans:public*']), updateProfile)
 */
export const invalidateCache = (keysOrPatterns = []) => {
  return async (req, res, next) => {
    try {
      if (!CACHE_CONFIG?.enabled || !Array.isArray(keysOrPatterns) || keysOrPatterns.length === 0) {
        return next();
      }
      await Promise.all(
        keysOrPatterns.map(async (k) => {
          if (k.includes('*')) {
            await deleteCachePattern(k);
          } else {
            await deleteCache(k);
          }
        })
      );
    } catch (e) {
      // ignore cache invalidation errors
    }
    return next();
  };
};

export default { cache, invalidateCache };
