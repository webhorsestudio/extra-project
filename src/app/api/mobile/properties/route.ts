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
        title,
        description,
        property_type,
        property_collection,
        location,
        latitude,
        longitude,
        created_at,
        updated_at,
        created_by,
        posted_by,
        developer_id,
        parking,
        parking_spots,
        rera_number,
        status,
        is_verified,
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

    // Text search for mobile
    const search = searchParams.get('search')
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%,property_type.ilike.%${search}%`)
    }

    // Location filter
    const location = searchParams.get('location')
    if (location) {
      query = query.eq('location_id', location)
    }

    // Property type filter
    const type = searchParams.get('type')
    if (type && type !== 'Any') {
      query = query.eq('property_type', type)
    }

    // Get all filter parameters early to avoid linter errors
    const bhk = searchParams.get('bhk')
    const minPrice = searchParams.get('min_price')
    const maxPrice = searchParams.get('max_price')

    // Category filter
    const category = searchParams.get('category')
    if (category) {
      console.log('Mobile properties API: Filtering by category:', category)
      
      // Use the property_category_relations table to filter by category
      // First, get properties that belong to this category
      const { data: categoryRelations, error: categoryError } = await supabase
        .from('property_category_relations')
        .select('property_id')
        .eq('category_id', category)
      
      console.log('Mobile properties API: Category relations found:', categoryRelations?.length || 0)
      
      if (!categoryError && categoryRelations && categoryRelations.length > 0) {
        const propertyIds = categoryRelations.map((relation: Record<string, unknown>) => relation.property_id as string)
        console.log('Mobile properties API: Filtering by property IDs:', propertyIds.length)
        query = query.in('id', propertyIds)
      } else {
        console.log('Mobile properties API: No category relations found, returning empty result')
        // If no category relations found, return empty result
        return NextResponse.json({ 
          properties: [],
          count: 0,
          filters: {
            search,
            location,
            type,
            category,
            bhk,
            minPrice,
            maxPrice
          }
        })
      }
    }

    // Property collection filter
    const propertyCollection = searchParams.get('property_collection')
    if (propertyCollection) {
      query = query.eq('property_collection', propertyCollection)
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
    if (bhk && bhk !== 'Any') {
      const targetBhk = Number(bhk)
      filteredData = filteredData.filter((property: Record<string, unknown>) => {
        if (!property.property_configurations || !Array.isArray(property.property_configurations) || property.property_configurations.length === 0) {
          return false
        }
        
        return property.property_configurations.some((config: Record<string, unknown>) => (config.bhk as number) === targetBhk)
      })
    }

    // Filter by price range after fetching
    
    if (minPrice || maxPrice) {
      filteredData = filteredData.filter((property: Record<string, unknown>) => {
        if (!property.property_configurations || !Array.isArray(property.property_configurations) || property.property_configurations.length === 0) {
          return false
        }
        
        return property.property_configurations.some((config: Record<string, unknown>) => {
          const price = config.price as number
          if (!price || price <= 0) return false
          
          const minBudget = minPrice ? Number(minPrice) * 100000 : 0
          const maxBudget = maxPrice ? Number(maxPrice) * 100000 : Infinity
          
          return price >= minBudget && price <= maxBudget
        })
      })
    }

    // Transform data for mobile display
    const mobileProperties = filteredData.map((property: Record<string, unknown>) => ({
      id: property.id as string,
      title: property.title as string,
      description: property.description as string,
      property_type: property.property_type as string || 'Apartment',
      property_collection: property.property_collection as string || 'Featured',
      location: property.location as string,
      latitude: property.latitude as number || 0,
      longitude: property.longitude as number || 0,
      created_at: property.created_at as string,
      updated_at: property.updated_at as string || property.created_at as string,
      created_by: property.created_by as string || '',
      posted_by: property.posted_by as string || '',
      developer_id: property.developer_id as string || null,
      parking: property.parking as boolean || false,
      parking_spots: property.parking_spots as number || null,
      rera_number: property.rera_number as string || null,
      status: property.status as string || 'active',
      is_verified: property.is_verified as boolean || false,
      location_data: Array.isArray(property.property_locations) ? property.property_locations[0] : property.property_locations,
      property_images: property.property_images ?? [],
      property_configurations: property.property_configurations ?? [],
      // Additional fields for mobile display
      price: (property.property_configurations as Record<string, unknown>[])?.[0]?.price ?? null,
      bhk: (property.property_configurations as Record<string, unknown>[])?.[0]?.bhk ?? null,
      area: (property.property_configurations as Record<string, unknown>[])?.[0]?.area ?? null,
      bedrooms: (property.property_configurations as Record<string, unknown>[])?.[0]?.bedrooms ?? null,
      bathrooms: (property.property_configurations as Record<string, unknown>[])?.[0]?.bathrooms ?? null,
      ready_by: (property.property_configurations as Record<string, unknown>[])?.[0]?.ready_by ?? null,
      // Initialize empty arrays for relationships
      amenities: [],
      categories: [],
      property_amenities: [],
      property_categories: [],
      property_views: [],
      property_favorites: [],
      view_count: 0,
      favorite_count: 0
    }))

    // Add cache headers for mobile performance
    const response = NextResponse.json({ 
      properties: mobileProperties,
      count: mobileProperties.length,
      filters: {
        search,
        location,
        type,
        category,
        bhk,
        minPrice,
        maxPrice
      }
    })
    
    // Cache for 5 minutes
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    
    return response

  } catch (error) {
    console.error('Unexpected error in mobile properties API:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred while fetching properties'
      }, 
      { status: 500 }
    )
  }
} 