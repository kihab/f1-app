// utils/cachingUtils.js
// ------------------------------------------------------------
// Utility for Redis-based caching operations
// ------------------------------------------------------------

const redisClientDefault = require('./redisClient');

/**
 * Factory function to create caching utilities with injectable dependencies
 * @param {Object} deps - Dependencies for caching utils
 * @param {Object} deps.redisClient - Redis client implementation
 * @returns {Object} - Caching utility methods
 */
function createCachingUtils(deps = {}) {
  // Use provided dependencies or defaults
  const redisClientModule = deps.redisClient || redisClientDefault;
  const client = redisClientModule.getClient();

  /**
   * Get data from cache if it exists
   * @param {string} key - Cache key
   * @returns {Promise<Object|null>} - Cached data or null if not found
   */
  async function getFromCache(key) {
    try {
      const cachedData = await client.get(key);
      
      if (!cachedData) {
        // Cache miss - not in cache
        return null;
      }
      
      // Parse the cached JSON data
      return JSON.parse(cachedData);
    } catch (error) {
      console.warn(`Cache retrieval error for key '${key}': ${error.message}`);
      return null; // Return null on error to trigger fallback to database
    }
  }

  /**
   * Set data in cache with expiration
   * @param {string} key - Cache key
   * @param {Object} data - Data to cache (will be JSON stringified)
   * @param {number} ttlSeconds - Time to live in seconds
   * @returns {Promise<boolean>} - Success status
   */
  async function setInCache(key, data, ttlSeconds = 300) {
    try {
      // Store data as JSON string with TTL
      await client.set(key, JSON.stringify(data), 'EX', ttlSeconds);
      return true;
    } catch (error) {
      console.warn(`Cache storage error for key '${key}': ${error.message}`);
      return false; // Return false to indicate cache update failure
    }
  }

  /**
   * Delete a key from cache
   * @param {string} key - Cache key to invalidate
   * @returns {Promise<boolean>} - Success status
   */
  async function invalidateCache(key) {
    try {
      await client.del(key);
      return true;
    } catch (error) {
      console.warn(`Cache invalidation error for key '${key}': ${error.message}`);
      return false;
    }
  }

  return {
    getFromCache,
    setInCache,
    invalidateCache
  };
}

// Create and export default instance
const defaultCachingUtils = createCachingUtils();

// Export both factory function and default instance
module.exports = {
  createCachingUtils, // For tests to create with mocked dependencies
  ...defaultCachingUtils // Export methods directly for easy access
};
