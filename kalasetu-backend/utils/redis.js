import { Redis } from '@upstash/redis';
import { CACHE_CONFIG } from '../config/env.config.js';

let redisClient = null;

/**
 * Initialize Redis client
 * @returns {Redis|null} Redis client or null
 */
export const initRedis = () => {
  if (!CACHE_CONFIG?.enabled || CACHE_CONFIG?.provider !== 'upstash') {
    console.log('⚠️ Redis caching is disabled');
    return null;
    }

  if (!CACHE_CONFIG.upstash?.url || !CACHE_CONFIG.upstash?.token) {
    console.warn('Upstash Redis credentials are not configured');
    return null;
  }

  try {
    redisClient = new Redis({
      url: CACHE_CONFIG.upstash.url,
      token: CACHE_CONFIG.upstash.token,
    });
    console.log('✅ Redis client initialized');
    return redisClient;
  } catch (error) {
    console.error('❌ Failed to initialize Redis:', error.message);
    return null;
  }
};

/**
 * Get Redis client instance
 * @returns {Redis|null}
 */
export const getRedisClient = () => {
  if (!redisClient) {
    return initRedis();
  }
  return redisClient;
};

/**
 * Set cache value
 * @param {string} key
 * @param {any} value
 * @param {number} ttl seconds
 */
export const setCache = async (key, value, ttl = CACHE_CONFIG.upstash?.ttl || CACHE_CONFIG.ttl || 300) => {
  const client = getRedisClient();
  if (!client) return false;

  try {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await client.set(key, serialized, { ex: ttl });
    } else {
      await client.set(key, serialized);
    }
    return true;
  } catch (error) {
    console.error(`❌ Failed to set cache for ${key}:`, error.message);
    return false;
  }
};

/**
 * Get cache value
 * @param {string} key
 */
export const getCache = async (key) => {
  const client = getRedisClient();
  if (!client) return null;

  try {
    const value = await client.get(key);
    if (!value) return null;
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      return value;
    }
  } catch (error) {
    console.error(`❌ Failed to get cache for ${key}:`, error.message);
    return null;
  }
};

/**
 * Delete cache key
 */
export const deleteCache = async (key) => {
  const client = getRedisClient();
  if (!client) return false;
  try {
    await client.del(key);
    return true;
  } catch (error) {
    console.error(`❌ Failed to delete cache ${key}:`, error.message);
    return false;
  }
};

/**
 * Delete keys by pattern
 */
export const deleteCachePattern = async (pattern) => {
  const client = getRedisClient();
  if (!client) return 0;
  try {
    // Upstash supports SCAN-like via KEYS for small cardinality
    const keys = await client.keys(pattern);
    if (!keys?.length) return 0;
    await client.del(...keys);
    return keys.length;
  } catch (error) {
    console.error(`❌ Failed to delete cache pattern ${pattern}:`, error.message);
    return 0;
  }
};

/**
 * Get TTL
 */
export const getCacheTTL = async (key) => {
  const client = getRedisClient();
  if (!client) return null;
  try {
    return await client.ttl(key);
  } catch (error) {
    console.error(`❌ Failed to get TTL for ${key}:`, error.message);
    return null;
  }
};

export default {
  initRedis,
  getRedisClient,
  setCache,
  getCache,
  deleteCache,
  deleteCachePattern,
  getCacheTTL,
};
