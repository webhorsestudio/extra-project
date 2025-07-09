import { useState, useCallback, useEffect } from 'react'

export interface Category {
  id: string
  name: string
  icon: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface UseCategoriesOptions {
  includeInactive?: boolean
  refreshInterval?: number // in milliseconds
  initialData?: Category[]
}

interface UseCategoriesReturn {
  categories: Category[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  getCategoryById: (id: string) => Category | undefined
  getCategoryByName: (name: string) => Category | undefined
}

// Global cache to avoid multiple API calls
let categoriesCache: Category[] | null = null

export function useCategories(options: UseCategoriesOptions = {}): UseCategoriesReturn {
  const { includeInactive = false, refreshInterval, initialData } = options
  const [categories, setCategories] = useState<Category[]>(initialData || [])
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    try {
      console.log('useCategories: Starting fetch')
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/categories')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch categories')
      }
      
      console.log('useCategories: Fetched categories:', data.categories?.length || 0)
      
      // Update cache
      categoriesCache = data.categories || []
      
      // Filter categories based on options
      let filteredCategories = categoriesCache
      if (!includeInactive && categoriesCache) {
        filteredCategories = categoriesCache.filter(cat => cat.is_active)
      }
      
      setCategories(filteredCategories || [])
    } catch (err) {
      console.error('useCategories: Error fetching categories:', err)
      setError(err instanceof Error ? err.message : 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }, [includeInactive])

  const refetch = useCallback(async () => {
    console.log('useCategories: Refetching categories')
    // Clear cache to force fresh fetch
    categoriesCache = null
    await fetchCategories()
  }, [fetchCategories])

  const getCategoryById = useCallback((id: string): Category | undefined => {
    return categories.find(cat => cat.id === id)
  }, [categories])

  const getCategoryByName = useCallback((name: string): Category | undefined => {
    return categories.find(cat => cat.name === name)
  }, [categories])

  // Initial fetch if no initial data
  useEffect(() => {
    if (!initialData) {
      fetchCategories()
    }
  }, [initialData, fetchCategories])

  // Set up refresh interval if specified
  useEffect(() => {
    if (refreshInterval) {
      const interval = setInterval(fetchCategories, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [refreshInterval, fetchCategories])

  return {
    categories,
    loading,
    error,
    refetch,
    getCategoryById,
    getCategoryByName
  }
} 