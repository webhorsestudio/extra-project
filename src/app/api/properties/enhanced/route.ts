import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { searchCacheService } from '@/lib/search/enhanced-cache'
import { fuzzySearchProperties } from '@/lib/search/fuzzy-search'

interface PropertyConfiguration {
  id: string
  bhk: number
  price: number
  area: number
  bedrooms: number
  bathrooms: number
  ready_by?: string
}

interface EnhancedProperty {
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
  property_configurations?: PropertyConfiguration[]
  property_images?: Array<{ id: string; image_url: string }>
  property_locations?: Array<{ id: string; name: string; description: string }>
}

export async function GET(req: NextRequest) {
  const startTime = Date.now()
  
  try {
    const supabase = await createSupabaseAdminClient()
    const { searchParams } = new URL(req.url)
    
    // Extract search parameters
    const search = searchParams.get('search')
    const location = searchParams.get('location')
    const bhk = searchParams.get('bhk')
    const minPrice = searchParams.get('min_price')
    const maxPrice = searchParams.get('max_price')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    // Create cache key
    const cacheKey = {
      search: search || undefined,
      location: location || undefined,
      bhk: bhk || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      limit
    }
    
    // Check cache first
    const cachedResults = searchCacheService.getCachedSearchResults(
      search || '',
      cacheKey
    )
    
    if (cachedResults) {
      const responseTime = Date.now() - startTime
      searchCacheService.recordQueryPerformance(search || '', responseTime)
      
      return NextResponse.json(
        { properties: cachedResults, total: cachedResults.length, cached: true },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, max-age=300', // 5 minutes
            'X-Cache': 'HIT',
            'X-Response-Time': responseTime.toString()
          }
        }
      )
    }

    // Build enhanced query with more fields
    let query = supabase
      .from('properties')
      .select(`
        id,
        slug,
        title,
        description,
        location,
        property_nature,
        video_url,
        created_at,
        updated_at,
        status,
        property_collection,
        property_configurations (
          id,
          bhk,
          price,
          area,
          bedrooms,
          bathrooms,
          ready_by
        ),
        property_images (
          id,
          image_url
        ),
        property_locations (
          id,
          name,
          description
        )
      `)
      .eq('status', 'active')

    // Enhanced text search - removed database ILIKE to avoid conflict with fuzzy search
    // We'll fetch all properties and let fuzzy search handle the filtering
    if (search) {
      // Don't filter at database level - let fuzzy search handle it
      // This prevents the dual search conflict
    }

    // Location filter
    if (location) {
      query = query.eq('location_id', location)
    }

    // Execute the query
    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch properties' },
        { status: 500 }
      )
    }

    let filteredProperties: EnhancedProperty[] = data || []

    // Apply fuzzy search if text search is provided
    if (search && filteredProperties.length > 0) {
      const fuzzyResults = fuzzySearchProperties(
        search,
        filteredProperties,
        { threshold: 0.4, maxResults: limit }
      )
      
      // Sort by fuzzy score and add metadata to properties
      filteredProperties = fuzzyResults
        .sort((a, b) => b.score - a.score)
        .map(result => ({
          ...result.property,
          fuzzyScore: result.score,
          matchedFields: result.matchedFields
        }))
        .slice(0, limit)
    }

    // Post-fetch filtering for complex queries
    if (bhk && bhk !== 'Any') {
      const bhkNum = parseInt(bhk)
      filteredProperties = filteredProperties.filter(property => {
        return property.property_configurations?.some((config: PropertyConfiguration) => 
          config.bhk === bhkNum
        )
      })
    }

    // Price range filtering
    if (minPrice || maxPrice) {
      const min = minPrice ? parseInt(minPrice) : 0
      const max = maxPrice ? parseInt(maxPrice) : Infinity
      
      filteredProperties = filteredProperties.filter(property => {
        const prices = property.property_configurations?.map((config: PropertyConfiguration) => config.price).filter(Boolean) || []
        if (prices.length === 0) return false
        
        const lowestPrice = Math.min(...prices)
        return lowestPrice >= min && lowestPrice <= max
      })
    }

    // Limit results
    const finalResults = filteredProperties.slice(0, limit)

    // Cache the results
    searchCacheService.cacheSearchResults(
      search || '',
      cacheKey,
      finalResults,
      300000 // 5 minutes
    )

    const responseTime = Date.now() - startTime
    searchCacheService.recordQueryPerformance(search || '', responseTime)

    return NextResponse.json(
      { 
        properties: finalResults, 
        total: finalResults.length,
        cached: false,
        searchTime: responseTime,
        fuzzySearch: !!search
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=300', // 5 minutes
          'X-Cache': 'MISS',
          'X-Response-Time': responseTime.toString(),
          'X-Fuzzy-Search': search ? 'enabled' : 'disabled'
        }
      }
    )

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
