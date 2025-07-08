'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

interface UseDataCacheOptions {
  ttl?: number // Time to live in milliseconds (default: 5 minutes)
  key?: string // Cache key (default: auto-generated)
  enabled?: boolean // Whether caching is enabled (default: true)
}

export function useDataCache<T>(
  fetcher: () => Promise<T>,
  options: UseDataCacheOptions = {}
): {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  clearCache: () => void
} {
  const { ttl = 5 * 60 * 1000, key = 'default', enabled = true } = options
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map())

  const getCacheKey = useCallback(() => {
    return `cache_${key}_${typeof fetcher}`
  }, [key, fetcher])

  const isCacheValid = useCallback((entry: CacheEntry<T>): boolean => {
    return Date.now() - entry.timestamp < entry.ttl
  }, [])

  const getCachedData = useCallback((): T | null => {
    if (!enabled) return null
    
    const cacheKey = getCacheKey()
    const entry = cacheRef.current.get(cacheKey)
    
    if (entry && isCacheValid(entry)) {
      return entry.data
    }
    
    // Remove expired entry
    if (entry) {
      cacheRef.current.delete(cacheKey)
    }
    
    return null
  }, [enabled, getCacheKey, isCacheValid])

  const setCachedData = useCallback((newData: T) => {
    if (!enabled) return
    
    const cacheKey = getCacheKey()
    cacheRef.current.set(cacheKey, {
      data: newData,
      timestamp: Date.now(),
      ttl
    })
  }, [enabled, getCacheKey, ttl])

  const clearCache = useCallback(() => {
    cacheRef.current.clear()
  }, [])

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)

      // Check cache first (unless forcing refresh)
      if (!forceRefresh) {
        const cachedData = getCachedData()
        if (cachedData !== null) {
          setData(cachedData)
          setLoading(false)
          return
        }
      }

      // Fetch fresh data
      const freshData = await fetcher()
      setData(freshData)
      setCachedData(freshData)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [fetcher, getCachedData, setCachedData])

  const refetch = useCallback(async () => {
    await fetchData(true)
  }, [fetchData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Cleanup expired cache entries periodically
  useEffect(() => {
    if (!enabled) return

    const cleanupInterval = setInterval(() => {
      const now = Date.now()
      for (const [cacheKey, entry] of cacheRef.current.entries()) {
        if (now - entry.timestamp >= entry.ttl) {
          cacheRef.current.delete(cacheKey)
        }
      }
    }, 60000) // Clean up every minute

    return () => clearInterval(cleanupInterval)
  }, [enabled])

  return {
    data,
    loading,
    error,
    refetch,
    clearCache
  }
}

// Global cache for cross-component data sharing
const globalCache = new Map<string, { data: any; timestamp: number; ttl: number }>()

export function useGlobalDataCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: { ttl?: number } = {}
): {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
} {
  const { ttl = 5 * 60 * 1000 } = options
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getCachedData = useCallback((): T | null => {
    const entry = globalCache.get(key)
    if (entry && Date.now() - entry.timestamp < entry.ttl) {
      return entry.data
    }
    
    // Remove expired entry
    if (entry) {
      globalCache.delete(key)
    }
    
    return null
  }, [key])

  const setCachedData = useCallback((newData: T) => {
    globalCache.set(key, {
      data: newData,
      timestamp: Date.now(),
      ttl
    })
  }, [key, ttl])

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)

      if (!forceRefresh) {
        const cachedData = getCachedData()
        if (cachedData !== null) {
          setData(cachedData)
          setLoading(false)
          return
        }
      }

      const freshData = await fetcher()
      setData(freshData)
      setCachedData(freshData)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [fetcher, getCachedData, setCachedData])

  const refetch = useCallback(async () => {
    await fetchData(true)
  }, [fetchData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch
  }
} 