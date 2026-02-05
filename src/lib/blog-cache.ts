import { getLatestBlogs } from './data'

// Simple in-memory cache for blog data
const blogCache = new Map<string, { data: Record<string, unknown>[], timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function getCachedBlogs(limit = 3) {
  const cacheKey = `latest-blogs-${limit}`
  const now = Date.now()
  
  // Check if we have valid cached data
  const cached = blogCache.get(cacheKey)
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    console.log('Returning cached blog data')
    return cached.data
  }
  
  // Fetch fresh data
  console.log('Fetching fresh blog data')
  const blogs = await getLatestBlogs(limit)
  
  // Cache the result
  blogCache.set(cacheKey, {
    data: blogs,
    timestamp: now
  })
  
  return blogs
}

// Clear cache (useful for testing or manual refresh)
export function clearBlogCache() {
  blogCache.clear()
  console.log('Blog cache cleared')
}

// Get cache status for debugging
export function getBlogCacheStatus() {
  const now = Date.now()
  const status: Record<string, { age: string; isValid: boolean; dataCount: number }> = {}
  
  for (const [key, value] of blogCache.entries()) {
    const age = now - value.timestamp
    const isValid = age < CACHE_DURATION
    status[key] = {
      age: Math.round(age / 1000) + 's',
      isValid,
      dataCount: value.data.length
    }
  }
  
  return status
} 