import { Property } from '@/types/property';
import { SimilarityScore } from '../similarity-algorithm';

export interface CacheConfig {
  ttl: number; // Time to live in seconds
  maxSize: number; // Maximum number of items in cache
  checkPeriod: number; // How often to check for expired items
}

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

class PropertyCache {
  private cache = new Map<string, CacheItem<unknown>>();
  private config: CacheConfig;
  private stats = {
    hits: 0,
    misses: 0,
  };

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ttl: 3600, // 1 hour default
      maxSize: 1000, // 1000 items max
      checkPeriod: 300, // Check every 5 minutes
      ...config,
    };

    // Start cleanup interval
    this.startCleanupInterval();
  }

  /**
   * Get item from cache
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      return null;
    }

    // Check if item is expired
    if (this.isExpired(item)) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update access statistics
    item.accessCount++;
    item.lastAccessed = Date.now();
    this.stats.hits++;

    return item.data as T;
  }

  /**
   * Set item in cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    // Remove expired items if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.ttl,
      accessCount: 0,
      lastAccessed: Date.now(),
    };

    this.cache.set(key, item);
  }

  /**
   * Delete item from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      hitRate: total > 0 ? this.stats.hits / total : 0,
    };
  }

  /**
   * Check if item is expired
   */
  private isExpired(item: CacheItem<unknown>): boolean {
    const now = Date.now();
    return (now - item.timestamp) / 1000 > item.ttl;
  }

  /**
   * Evict least recently used item
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Start cleanup interval
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanup();
    }, this.config.checkPeriod * 1000);
  }

  /**
   * Clean up expired items
   */
  private cleanup(): void {
    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        this.cache.delete(key);
      }
    }
  }
}

// Cache keys generator
export class CacheKeys {
  static property(slug: string): string {
    return `property:${slug}`;
  }

  static similarProperties(propertyId: string): string {
    return `similar:${propertyId}`;
  }

  static userPreferences(userId: string): string {
    return `prefs:${userId}`;
  }

  static propertyViews(propertyId: string): string {
    return `views:${propertyId}`;
  }

  static searchResults(query: string): string {
    return `search:${Buffer.from(query).toString('base64')}`;
  }

  static featuredProperties(): string {
    return 'featured:properties';
  }

  static locationProperties(locationId: string): string {
    return `location:${locationId}`;
  }
}

// Property-specific cache operations
export class PropertyCacheService {
  private cache: PropertyCache;

  constructor() {
    this.cache = new PropertyCache({
      ttl: 1800, // 30 minutes for properties
      maxSize: 500,
    });
  }

  /**
   * Cache property data
   */
  cacheProperty(property: Property): void {
    const key = CacheKeys.property(property.slug || property.id);
    this.cache.set(key, property, 1800); // 30 minutes
  }

  /**
   * Get cached property
   */
  getCachedProperty(slug: string): Property | null {
    const key = CacheKeys.property(slug);
    return this.cache.get<Property>(key);
  }

  /**
   * Cache similar properties
   */
  cacheSimilarProperties(propertyId: string, similarProperties: Property[], scores: SimilarityScore[]): void {
    const key = CacheKeys.similarProperties(propertyId);
    this.cache.set(key, { properties: similarProperties, scores }, 900); // 15 minutes
  }

  /**
   * Get cached similar properties
   */
  getCachedSimilarProperties(propertyId: string): { properties: Property[]; scores: SimilarityScore[] } | null {
    const key = CacheKeys.similarProperties(propertyId);
    return this.cache.get<{ properties: Property[]; scores: SimilarityScore[] }>(key);
  }

  /**
   * Cache user preferences
   */
  cacheUserPreferences(userId: string, preferences: Record<string, unknown>): void {
    const key = CacheKeys.userPreferences(userId);
    this.cache.set(key, preferences, 3600); // 1 hour
  }

  /**
   * Get cached user preferences
   */
  getCachedUserPreferences(userId: string): Record<string, unknown> | null {
    const key = CacheKeys.userPreferences(userId);
    return this.cache.get<Record<string, unknown>>(key);
  }

  /**
   * Cache search results
   */
  cacheSearchResults(query: string, results: Property[]): void {
    const key = CacheKeys.searchResults(query);
    this.cache.set(key, results, 600); // 10 minutes
  }

  /**
   * Get cached search results
   */
  getCachedSearchResults(query: string): Property[] | null {
    const key = CacheKeys.searchResults(query);
    return this.cache.get<Property[]>(key);
  }

  /**
   * Invalidate property cache
   */
  invalidateProperty(propertyId: string): void {
    // Invalidate property cache
    this.cache.delete(CacheKeys.property(propertyId));
    
    // Invalidate similar properties cache
    this.cache.delete(CacheKeys.similarProperties(propertyId));
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return this.cache.getStats();
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const propertyCache = new PropertyCacheService(); 