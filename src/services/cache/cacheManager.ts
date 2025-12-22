/**
 * @category Services
 */
import { LRUCache } from 'lru-cache';

/**
 * In-memory cache manager using LRU (Least Recently Used) eviction strategy.
 *
 * Provides efficient caching for API responses, computed values, and temporary data
 * to reduce external API calls and improve performance. Uses LRU eviction to
 * automatically manage memory usage by removing least recently accessed items.
 *
 * Features:
 * - Configurable cache size and TTL (Time To Live)
 * - Type-safe get/set operations
 * - Automatic expiration and cleanup
 * - Cache statistics and monitoring
 *
 * @example
 * ```typescript
 * // Create cache with 200 items max, 2 minute TTL
 * const cache = new CacheManager(200, 2 * 60 * 1000);
 *
 * // Store API response
 * const apiData = await fetchFromAPI();
 * cache.set('api_response_key', apiData);
 *
 * // Retrieve cached data
 * const cachedData = cache.get<ApiResponse>('api_response_key');
 * if (cachedData) {
 *   return cachedData; // Use cached data
 * }
 *
 * // Check cache statistics
 * const stats = cache.getStats();
 * console.log(`Cache usage: ${stats.size}/${stats.max}`);
 * ```
 */
export class CacheManager {
  private cache: LRUCache<string, string | number | boolean | object>;

  /**
   * Creates a new cache manager instance.
   *
   * @param maxSize - Maximum number of items to store in cache (default: 100)
   * @param ttlMs - Time to live in milliseconds for cached items (default: 5 minutes)
   *
   * @example
   * ```typescript
   * // Default cache (100 items, 5 minutes TTL)
   * const cache = new CacheManager();
   *
   * // Custom cache (500 items, 1 hour TTL)
   * const cache = new CacheManager(500, 60 * 60 * 1000);
   * ```
   */
  constructor(maxSize: number = 100, ttlMs: number = 5 * 60 * 1000) {
    this.cache = new LRUCache({
      max: maxSize, // Max number of items to store
      ttl: ttlMs, // TTL
    });
  }

  /**
   * Retrieves a value from cache with type safety.
   *
   * @param key - Cache key to look up
   * @returns The cached value cast to type T, or undefined if not found or expired
   *
   * @example
   * ```typescript
   * const user = cache.get<User>('user_123');
   * if (user) {
   *   console.log('Found cached user:', user.name);
   * }
   * ```
   */
  get<T>(key: string): T | undefined {
    return this.cache.get(key) as T | undefined;
  }

  /**
   * Stores a value in cache with the specified key.
   *
   * @param key - Unique identifier for the cached value
   * @param value - Value to store (string, number, boolean, or object)
   *
   * @example
   * ```typescript
   * cache.set('user_123', { id: 123, name: 'John' });
   * cache.set('api_call_count', 42);
   * cache.set('feature_enabled', true);
   * ```
   */
  set(key: string, value: string | number | boolean | object): void {
    this.cache.set(key, value);
  }

  /**
   * Checks if a key exists in cache and hasn't expired.
   *
   * @param key - Cache key to check
   * @returns True if key exists and is valid, false otherwise
   *
   * @example
   * ```typescript
   * if (cache.has('expensive_computation')) {
   *   return cache.get('expensive_computation');
   * } else {
   *   const result = performExpensiveComputation();
   *   cache.set('expensive_computation', result);
   *   return result;
   * }
   * ```
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Removes a specific key from cache.
   *
   * @param key - Cache key to delete
   *
   * @example
   * ```typescript
   * // Remove outdated data
   * cache.delete('stale_data_key');
   * ```
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clears all cached data.
   *
   * @example
   * ```typescript
   * // Clear all cache on configuration change
   * cache.clear();
   * ```
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Retrieves cache usage statistics.
   *
   * @returns Object containing current size and maximum capacity
   *
   * @example
   * ```typescript
   * const stats = cache.getStats();
   * console.log(`Cache utilization: ${(stats.size / stats.max * 100).toFixed(1)}%`);
   *
   * if (stats.size >= stats.max * 0.9) {
   *   console.warn('Cache is nearly full');
   * }
   * ```
   */
  getStats(): { size: number; max: number } {
    return {
      size: this.cache.size,
      max: this.cache.max,
    };
  }
}
