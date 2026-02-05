import { useState, useEffect, useCallback } from 'react'

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description?: string
  created_at: string
  updated_at: string
}

interface UseBlogCategoriesOptions {
  refreshInterval?: number // in milliseconds
}

interface UseBlogCategoriesReturn {
  categories: BlogCategory[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  getCategoryById: (id: string) => BlogCategory | undefined
  getCategoryBySlug: (slug: string) => BlogCategory | undefined
}

// Global cache to avoid multiple API calls
let blogCategoriesCache: BlogCategory[] | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useBlogCategories(options: UseBlogCategoriesOptions = {}): UseBlogCategoriesReturn {
  const { refreshInterval } = options
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/blog-categories')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch blog categories')
      }
      
      // Update cache
      blogCategoriesCache = data.categories || []
      cacheTimestamp = Date.now()
      
      setCategories(blogCategoriesCache || [])
    } catch (err) {
      console.error('Error fetching blog categories:', err)
      setError(err instanceof Error ? err.message : 'Failed to load blog categories')
    } finally {
      setLoading(false)
    }
  }, [])

  const refetch = useCallback(async () => {
    // Clear cache to force fresh fetch
    blogCategoriesCache = null
    cacheTimestamp = 0
    await fetchCategories()
  }, [fetchCategories])

  const getCategoryById = useCallback((id: string): BlogCategory | undefined => {
    return categories.find(cat => cat.id === id)
  }, [categories])

  const getCategoryBySlug = useCallback((slug: string): BlogCategory | undefined => {
    return categories.find(cat => cat.slug === slug)
  }, [categories])

  useEffect(() => {
    // Check if we have valid cached data
    const now = Date.now()
    if (blogCategoriesCache && (now - cacheTimestamp) < CACHE_DURATION) {
      // Use cached data
      setCategories(blogCategoriesCache)
      setLoading(false)
    } else {
      // Fetch fresh data
      fetchCategories()
    }
  }, [fetchCategories])

  // Set up refresh interval if specified
  useEffect(() => {
    if (!refreshInterval) return

    const interval = setInterval(() => {
      fetchCategories()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [refreshInterval, fetchCategories])

  return {
    categories,
    loading,
    error,
    refetch,
    getCategoryById,
    getCategoryBySlug
  }
} 