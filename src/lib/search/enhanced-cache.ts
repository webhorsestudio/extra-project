/**
 * Enhanced Search Cache System
 * Implements advanced caching strategies for search results
 */

interface SearchResult {
  id: string
  slug?: string
  title?: string
  description?: string
  location?: string
  property_nature?: string
  video_url?: string
  created_at?: string
  updated_at?: string
  status?: string
  property_collection?: string
  fuzzyScore?: number
  matchedFields?: string[]
  property_configurations?: Array<{
    id: string
    bhk: number
    price: number
    area: number
    bedrooms: number
    bathrooms: number
    ready_by?: string
  }>
  property_images?: Array<{ id: string; image_url: string }>
  property_locations?: Array<{ id: string; name: string; description: string }>
}

interface CacheFilters {
  search?: string
  location?: string
  bhk?: string
  minPrice?: string
  maxPrice?: string
  limit?: number
}

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
  query: string
  filters: CacheFilters
}

interface CacheStats {
  hits: number
  misses: number
  size: number
  hitRate: number
  totalQueries: number
  averageResponseTime: number
}

interface SearchCacheConfig {
  maxSize: number
  defaultTTL: number
  cleanupInterval: number
  enableCompression: boolean
  enableAnalytics: boolean
}

class EnhancedSearchCache {
  private cache = new Map<string, CacheItem<unknown>>()
  private config: SearchCacheConfig
  private stats = {
    hits: 0,
    misses: 0,
    totalQueries: 0,
    totalResponseTime: 0
  }
  private cleanupTimer: NodeJS.Timeout | null = null

  constructor(config: Partial<SearchCacheConfig> = {}) {
    this.config = {
      maxSize: 1000,
      defaultTTL: 300000, // 5 minutes
      cleanupInterval: 60000, // 1 minute
      enableCompression: true,
      enableAnalytics: true,
      ...config
    }

    this.startCleanupTimer()
  }

  /**
   * Generate cache key from query and filters
   */
  private generateCacheKey(query: string, filters: CacheFilters = {}): string {
    const normalizedQuery = query.toLowerCase().trim()
    const sortedFilters = Object.keys(filters)
      .sort()
      .reduce((acc, key) => {
        const filterKey = key as keyof CacheFilters
        const value = filters[filterKey]
        if (value !== undefined) {
          acc[key] = value
        }
        return acc
      }, {} as Record<string, string | number>)
    
    return `${normalizedQuery}:${JSON.stringify(sortedFilters)}`
  }

  /**
   * Get cached search result
   */
  get<T>(query: string, filters: CacheFilters = {}): T | null {
    const key = this.generateCacheKey(query, filters)
    const item = this.cache.get(key)
    
    if (!item) {
      this.stats.misses++
      return null
    }

    // Check if item is expired
    if (this.isExpired(item)) {
      this.cache.delete(key)
      this.stats.misses++
      return null
    }

    // Update access statistics
    item.accessCount++
    item.lastAccessed = Date.now()
    this.stats.hits++

    return item.data as T
  }

  /**
   * Set search result in cache
   */
  set<T>(
    query: string, 
    filters: CacheFilters, 
    data: T, 
    ttl?: number
  ): void {
    const key = this.generateCacheKey(query, filters)
    
    // Remove expired items if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU()
    }

    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      accessCount: 0,
      lastAccessed: Date.now(),
      query,
      filters
    }

    this.cache.set(key, item)
  }

  /**
   * Check if item is expired
   */
  private isExpired<T>(item: CacheItem<T>): boolean {
    const now = Date.now()
    return (now - item.timestamp) > item.ttl
  }

  /**
   * Evict least recently used item
   */
  private evictLRU(): void {
    let oldestKey: string | null = null
    let oldestTime = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval)
  }

  /**
   * Clean up expired items
   */
  private cleanup(): void {
    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      totalQueries: this.stats.totalQueries,
      averageResponseTime: this.stats.totalQueries > 0 
        ? this.stats.totalResponseTime / this.stats.totalQueries 
        : 0
    }
  }

  /**
   * Record query performance
   */
  recordQuery(responseTime: number): void {
    this.stats.totalQueries++
    this.stats.totalResponseTime += responseTime
  }

  /**
   * Get popular search queries
   */
  getPopularQueries(limit: number = 10): Array<{
    query: string
    filters: CacheFilters
    accessCount: number
    lastAccessed: number
  }> {
    const items = Array.from(this.cache.values())
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, limit)
      .map(item => ({
        query: item.query,
        filters: item.filters,
        accessCount: item.accessCount,
        lastAccessed: item.lastAccessed
      }))

    return items
  }

  /**
   * Get recent search queries
   */
  getRecentQueries(limit: number = 10): Array<{
    query: string
    filters: CacheFilters
    timestamp: number
  }> {
    const items = Array.from(this.cache.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
      .map(item => ({
        query: item.query,
        filters: item.filters,
        timestamp: item.timestamp
      }))

    return items
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear()
    this.stats.hits = 0
    this.stats.misses = 0
    this.stats.totalQueries = 0
    this.stats.totalResponseTime = 0
  }

  /**
   * Delete specific cache entry
   */
  delete(query: string, filters: CacheFilters = {}): boolean {
    const key = this.generateCacheKey(query, filters)
    return this.cache.delete(key)
  }

  /**
   * Invalidate cache entries matching pattern
   */
  invalidatePattern(pattern: RegExp): number {
    let deletedCount = 0
    for (const [key, item] of this.cache.entries()) {
      if (pattern.test(item.query)) {
        this.cache.delete(key)
        deletedCount++
      }
    }
    return deletedCount
  }

  /**
   * Destroy cache and cleanup
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
    this.clear()
  }
}

/**
 * Search Cache Service
 * High-level service for managing search cache
 */
export class SearchCacheService {
  private cache: EnhancedSearchCache
  private queryCache: EnhancedSearchCache
  private suggestionCache: EnhancedSearchCache

  constructor() {
    this.cache = new EnhancedSearchCache({
      maxSize: 500,
      defaultTTL: 300000, // 5 minutes
      enableAnalytics: true
    })

    this.queryCache = new EnhancedSearchCache({
      maxSize: 200,
      defaultTTL: 600000, // 10 minutes
      enableAnalytics: true
    })

    this.suggestionCache = new EnhancedSearchCache({
      maxSize: 100,
      defaultTTL: 1800000, // 30 minutes
      enableAnalytics: true
    })
  }

  /**
   * Cache search results
   */
  cacheSearchResults(
    query: string,
    filters: CacheFilters,
    results: SearchResult[],
    ttl?: number
  ): void {
    this.cache.set(query, filters, results, ttl)
  }

  /**
   * Get cached search results
   */
  getCachedSearchResults(
    query: string,
    filters: CacheFilters = {}
  ): SearchResult[] | null {
    return this.cache.get(query, filters)
  }

  /**
   * Cache search suggestions
   */
  cacheSuggestions(query: string, suggestions: string[]): void {
    this.suggestionCache.set(query, {}, suggestions)
  }

  /**
   * Get cached suggestions
   */
  getCachedSuggestions(query: string): string[] | null {
    return this.suggestionCache.get(query, {})
  }

  /**
   * Cache query performance data
   */
  recordQueryPerformance(query: string, responseTime: number): void {
    this.cache.recordQuery(responseTime)
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    search: CacheStats
    suggestions: CacheStats
    queries: CacheStats
  } {
    return {
      search: this.cache.getStats(),
      suggestions: this.suggestionCache.getStats(),
      queries: this.queryCache.getStats()
    }
  }

  /**
   * Get popular searches
   */
  getPopularSearches(limit: number = 10): Array<{
    query: string
    filters: CacheFilters
    accessCount: number
  }> {
    return this.cache.getPopularQueries(limit)
  }

  /**
   * Get recent searches
   */
  getRecentSearches(limit: number = 10): Array<{
    query: string
    filters: CacheFilters
    timestamp: number
  }> {
    return this.cache.getRecentQueries(limit)
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    this.cache.clear()
    this.queryCache.clear()
    this.suggestionCache.clear()
  }

  /**
   * Invalidate cache for specific query
   */
  invalidateQuery(query: string, filters: CacheFilters = {}): void {
    this.cache.delete(query, filters)
    this.suggestionCache.delete(query, {})
  }
}

// Export singleton instance
export const searchCacheService = new SearchCacheService()

// Export types
export type { CacheStats, SearchCacheConfig }
