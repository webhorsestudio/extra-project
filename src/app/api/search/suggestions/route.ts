import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { searchCacheService } from '@/lib/search/enhanced-cache'
import { generateSearchSuggestions, REAL_ESTATE_DICTIONARY } from '@/lib/search/fuzzy-search'

export async function GET(req: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')
    
    if (!query.trim()) {
      return NextResponse.json({ suggestions: [] })
    }

    // Check cache first
    const cachedSuggestions = searchCacheService.getCachedSuggestions(query)
    if (cachedSuggestions) {
      const responseTime = Date.now() - startTime
      return NextResponse.json(
        { suggestions: cachedSuggestions, cached: true },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, max-age=1800', // 30 minutes
            'X-Cache': 'HIT',
            'X-Response-Time': responseTime.toString()
          }
        }
      )
    }

    const supabase = await createSupabaseAdminClient()
    
    // Get suggestions from multiple sources
    const [propertiesData, locationsData, popularSearches] = await Promise.all([
      // Property titles
      supabase
        .from('properties')
        .select('title, property_type')
        .eq('status', 'active')
        .limit(50),
      
      // Location names
      supabase
        .from('property_locations')
        .select('name, description')
        .eq('is_active', true)
        .limit(30),
      
      // Popular searches (mock data - in real implementation, this would come from analytics)
      Promise.resolve({
        data: [
          { query: '2 BHK apartment', count: 1250 },
          { query: '3 BHK villa', count: 890 },
          { query: 'Ready to move', count: 2100 },
          { query: 'Under 50L', count: 1800 },
          { query: 'Swimming pool', count: 1200 },
          { query: 'Mumbai', count: 5000 },
          { query: 'Bangalore', count: 3200 },
          { query: 'Delhi NCR', count: 2800 }
        ]
      })
    ])

    // Combine all suggestions
    const allSuggestions: string[] = []
    
    // Add property titles
    if (propertiesData.data) {
      propertiesData.data.forEach(property => {
        allSuggestions.push(property.title)
        allSuggestions.push(`${property.property_type} in ${property.title}`)
      })
    }
    
    // Add location names
    if (locationsData.data) {
      locationsData.data.forEach(location => {
        allSuggestions.push(location.name)
        if (location.description) {
          allSuggestions.push(`${location.name} - ${location.description}`)
        }
      })
    }
    
    // Add popular searches
    if (popularSearches.data) {
      popularSearches.data.forEach(search => {
        allSuggestions.push(search.query)
      })
    }
    
    // Add property types
    const propertyTypes = ['Apartment', 'House', 'Villa', 'Penthouse', 'Commercial', 'Land']
    propertyTypes.forEach(type => {
      allSuggestions.push(`${type} Properties`)
      allSuggestions.push(`${type} for sale`)
      allSuggestions.push(`${type} for rent`)
    })
    
    // Add amenities
    const amenities = ['Swimming Pool', 'Gym', 'Parking', 'Garden', 'Clubhouse', 'Playground']
    amenities.forEach(amenity => {
      allSuggestions.push(`Properties with ${amenity}`)
      allSuggestions.push(`${amenity} facilities`)
    })
    
    // Add real estate dictionary terms
    allSuggestions.push(...REAL_ESTATE_DICTIONARY)
    
    // Remove duplicates and use fuzzy search to find best matches
    const uniqueSuggestions = [...new Set(allSuggestions)]
    const fuzzyResults = generateSearchSuggestions(query, uniqueSuggestions, {
      threshold: 0.6,
      maxResults: limit
    })
    
    // Format suggestions with metadata
    const suggestions = fuzzyResults.map(result => ({
      text: result.suggestion,
      score: result.score,
      type: result.type,
      category: getSuggestionCategory(result.suggestion)
    }))
    
    // Cache the suggestions
    searchCacheService.cacheSuggestions(query, suggestions.map(s => s.text))
    
    const responseTime = Date.now() - startTime
    
    return NextResponse.json(
      { 
        suggestions,
        total: suggestions.length,
        cached: false,
        searchTime: responseTime
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=1800', // 30 minutes
          'X-Cache': 'MISS',
          'X-Response-Time': responseTime.toString()
        }
      }
    )

  } catch (error) {
    console.error('Suggestions API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getSuggestionCategory(suggestion: string): string {
  const lowerSuggestion = suggestion.toLowerCase()
  
  if (lowerSuggestion.includes('apartment') || lowerSuggestion.includes('house') || 
      lowerSuggestion.includes('villa') || lowerSuggestion.includes('penthouse')) {
    return 'property_type'
  }
  
  if (lowerSuggestion.includes('mumbai') || lowerSuggestion.includes('bangalore') || 
      lowerSuggestion.includes('delhi') || lowerSuggestion.includes('pune')) {
    return 'location'
  }
  
  if (lowerSuggestion.includes('bhk') || lowerSuggestion.includes('bedroom')) {
    return 'configuration'
  }
  
  if (lowerSuggestion.includes('pool') || lowerSuggestion.includes('gym') || 
      lowerSuggestion.includes('parking') || lowerSuggestion.includes('garden')) {
    return 'amenity'
  }
  
  if (lowerSuggestion.includes('ready') || lowerSuggestion.includes('under construction') || 
      lowerSuggestion.includes('newly launched')) {
    return 'status'
  }
  
  return 'general'
}
