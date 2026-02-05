import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseAdminClient()
    const { searchParams } = new URL(req.url)

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

    // Text search - improved to search in more fields
    const search = searchParams.get('search')
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%,property_type.ilike.%${search}%`)
    }

    // Location filter - use location_id if provided
    const location = searchParams.get('location')
    if (location) {
      query = query.eq('location_id', location)
    }

    // Property type filter
    const type = searchParams.get('type')
    if (type && type !== 'Any') {
      query = query.eq('property_type', type)
    }

    // Fetch properties
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { 
          error: 'Failed to fetch properties',
          details: error.message 
        }, 
        { status: 500 }
      )
    }


    // Filter by BHK configuration after fetching
    let filteredData = data || []
    const bhk = searchParams.get('bhk')
    if (bhk && bhk !== 'Any') {
      const targetBhk = Number(bhk)
      filteredData = filteredData.filter((property: Record<string, unknown>) => {
        if (!property.property_configurations || !Array.isArray(property.property_configurations) || property.property_configurations.length === 0) {
          return false
        }
        
        // Check if any configuration matches the BHK requirement
        return property.property_configurations.some((config: Record<string, unknown>) => (config.bhk as number) === targetBhk)
      })
    }

    // Filter by price range after fetching (since we can't easily filter on joined table)
    const minPrice = searchParams.get('min_price')
    const maxPrice = searchParams.get('max_price')
    
    if (minPrice || maxPrice) {
      filteredData = filteredData.filter((property: Record<string, unknown>) => {
        if (!property.property_configurations || !Array.isArray(property.property_configurations) || property.property_configurations.length === 0) {
          return false
        }
        
        // Check if any configuration matches the price range
        return property.property_configurations.some((config: Record<string, unknown>) => {
          const price = config.price as number
          if (!price || price <= 0) return false
          
          // Convert Lacs to actual price for comparison
          const minBudget = minPrice ? Number(minPrice) * 100000 : 0
          const maxBudget = maxPrice ? Number(maxPrice) * 100000 : Infinity
          
          return price >= minBudget && price <= maxBudget
        })
      })
    }

    // Transform data to match the same structure as featured/latest properties
    const propertiesWithLocation = filteredData.map((property: Record<string, unknown>) => ({
      ...property,
      price: (property.property_configurations as Record<string, unknown>[])?.[0]?.price ?? null,
      location_data: Array.isArray(property.property_locations) ? property.property_locations[0] : property.property_locations
    }))


    // Add cache headers for better performance
    const response = NextResponse.json({ 
      properties: propertiesWithLocation,
      count: propertiesWithLocation.length,
      filters: {
        search,
        location,
        type,
        bhk,
        minPrice,
        maxPrice
      }
    })
    
    // Cache for 5 minutes
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    
    return response

  } catch (error) {
    console.error('Unexpected error in properties API:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred while fetching properties'
      }, 
      { status: 500 }
    )
  }
} 