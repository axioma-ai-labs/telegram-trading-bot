import { LRUCache } from 'lru-cache';

/**
 * Simple cache manager using LRU (Least Recently Used) cache
 * Perfect for caching API responses and reducing external API calls
 */
export class CacheManager {
  private cache: LRUCache<string, string | number | boolean | object>;

  constructor(maxSize: number = 100, ttlMs: number = 5 * 60 * 1000) {
    this.cache = new LRUCache({
      max: maxSize, // Max number of items to store
      ttl: ttlMs, // TTL
    });
  }

  // get value from cache
  get<T>(key: string): T | undefined {
    return this.cache.get(key) as T | undefined;
  }

  // set value in cache
  set(key: string, value: string | number | boolean | object): void {
    this.cache.set(key, value);
  }

  // check if key exists in cache
  has(key: string): boolean {
    return this.cache.has(key);
  }

  // delete key from cache
  delete(key: string): void {
    this.cache.delete(key);
  }

  // clear all cache
  clear(): void {
    this.cache.clear();
  }

  // get cache stats
  getStats(): { size: number; max: number } {
    return {
      size: this.cache.size,
      max: this.cache.max,
    };
  }
}
