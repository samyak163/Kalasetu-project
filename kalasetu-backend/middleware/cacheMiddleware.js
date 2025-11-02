import { getCache, setCache, deleteCache, deleteCachePattern } from '../utils/redis.js';
import { CACHE_CONFIG } from '../config/env.config.js';

/**
 * Cache middleware for GET endpoints
 * Usage: app.get('/route', cache('keyPrefix', ttl), handler)
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
      const originalJson = res.json.bind(res);
      res.json = async (body) => {
        // Avoid caching errors or non-success bodies
        if (res.statusCode >= 200 && res.statusCode < 300 && body) {
          // Some handlers wrap { data } while others return array/object; normalize to body.data || body
          const payload = body?.data ?? body;
          await setCache(key, payload, ttl);
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
 * Invalidate cache keys by exact keys or patterns
 * Usage on mutation routes: router.post('/update', invalidateCache(['cache:artisans:list*','cache:artisans:public*']), handler)
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
