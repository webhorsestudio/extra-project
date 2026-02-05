import { NextRequest, NextResponse } from 'next/server'
import { searchCacheService } from '@/lib/search/enhanced-cache'

interface SearchQuery {
  query: string
  filters: {
    search?: string
    location?: string
    bhk?: string
    minPrice?: string
    maxPrice?: string
    limit?: number
  }
  accessCount?: number
  timestamp?: number
  lastAccessed?: number
}

function calculateSearchTrends(popular: SearchQuery[], recent: SearchQuery[]): {
  trendingUp: string[]
  trendingDown: string[]
  newTrends: string[]
} {
  // Simple trend calculation based on recent vs popular searches
  const trendingUp: string[] = []
  const trendingDown: string[] = []
  const newTrends: string[] = []
  
  // Find searches that are trending up (in recent but not in popular)
  recent.forEach(recentSearch => {
    const isInPopular = popular.some(pop => pop.query === recentSearch.query)
    if (!isInPopular) {
      newTrends.push(recentSearch.query)
    }
  })
  
  // Find searches that are trending down (in popular but not in recent)
  popular.forEach(popularSearch => {
    const isInRecent = recent.some(rec => rec.query === popularSearch.query)
    if (!isInRecent) {
      trendingDown.push(popularSearch.query)
    }
  })
  
  return {
    trendingUp: trendingUp.slice(0, 5),
    trendingDown: trendingDown.slice(0, 5),
    newTrends: newTrends.slice(0, 5)
  }
}

export async function GET() {
  try {
    // Get cache statistics
    const cacheStats = searchCacheService.getCacheStats()
    
    // Get popular searches
    const popularSearches = searchCacheService.getPopularSearches(20)
    
    // Get recent searches
    const recentSearches = searchCacheService.getRecentSearches(20)
    
    // Calculate search trends
    const searchTrends = calculateSearchTrends(popularSearches, recentSearches)
    
    // Get performance metrics
    const performanceMetrics = {
      averageResponseTime: cacheStats.search.averageResponseTime,
      hitRate: cacheStats.search.hitRate,
      totalQueries: cacheStats.search.totalQueries,
      cacheSize: cacheStats.search.size
    }
    
    const analytics = {
      cacheStats,
      popularSearches,
      recentSearches,
      searchTrends,
      performanceMetrics,
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json(analytics, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { query, filters, responseTime, resultCount, userId } = body
    
    // Log search analytics (in real implementation, this would be stored in database)
    console.log('Search Analytics:', {
      query,
      filters,
      responseTime,
      resultCount,
      userId,
      timestamp: new Date().toISOString()
    })
    
    // Record query performance
    if (responseTime) {
      searchCacheService.recordQueryPerformance(query, responseTime)
    }
    
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Analytics POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}