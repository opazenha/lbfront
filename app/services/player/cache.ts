// Simple in-memory cache for API responses
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class ApiCache {
  private cache: Record<string, CacheItem<any>> = {};
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  get<T>(key: string): T | null {
    const item = this.cache[key];
    
    if (!item) {
      return null;
    }

    // Check if the item has expired
    if (Date.now() > item.expiresAt) {
      delete this.cache[key];
      return null;
    }

    return item.data;
  }

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const timestamp = Date.now();
    const expiresAt = timestamp + ttl;
    
    this.cache[key] = {
      data,
      timestamp,
      expiresAt
    };
  }

  clear(): void {
    this.cache = {};
  }
}

// Create a singleton instance
export const apiCache = new ApiCache();
