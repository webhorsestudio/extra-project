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
        location,
        latitude,
        longitude,
        created_at,
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
        const propertyIds = categoryRelations.map((relation: any) => relation.property_id)
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
      filteredData = filteredData.filter((property: any) => {
        if (!property.property_configurations || !Array.isArray(property.property_configurations) || property.property_configurations.length === 0) {
          return false
        }
        
        return property.property_configurations.some((config: any) => config.bhk === targetBhk)
      })
    }

    // Filter by price range after fetching
    
    if (minPrice || maxPrice) {
      filteredData = filteredData.filter((property: any) => {
        if (!property.property_configurations || !Array.isArray(property.property_configurations) || property.property_configurations.length === 0) {
          return false
        }
        
        return property.property_configurations.some((config: any) => {
          const price = config.price
          if (!price || price <= 0) return false
          
          const minBudget = minPrice ? Number(minPrice) * 100000 : 0
          const maxBudget = maxPrice ? Number(maxPrice) * 100000 : Infinity
          
          return price >= minBudget && price <= maxBudget
        })
      })
    }

    // Transform data for mobile display
    const mobileProperties = filteredData.map((property: any) => ({
      id: property.id,
      title: property.title,
      description: property.description,
      location: property.location,
      latitude: property.latitude ?? null,
      longitude: property.longitude ?? null,
      location_data: Array.isArray(property.property_locations) ? property.property_locations[0] : property.property_locations,
      price: property.property_configurations?.[0]?.price ?? null,
      bhk: property.property_configurations?.[0]?.bhk ?? null,
      area: property.property_configurations?.[0]?.area ?? null,
      bedrooms: property.property_configurations?.[0]?.bedrooms ?? null,
      bathrooms: property.property_configurations?.[0]?.bathrooms ?? null,
      ready_by: property.property_configurations?.[0]?.ready_by ?? null,
      property_images: property.property_images ?? [],
      created_at: property.created_at,
      property_collection: property.property_collection
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