import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  try {
    console.log('Mobile locations API: Starting request')
    
    const supabase = await createSupabaseAdminClient()
    console.log('Mobile locations API: Supabase client created')
    
    const { searchParams } = new URL(req.url)
    
    let query = supabase
      .from('property_locations')
      .select(`
        id,
        name,
        description,
        image_url
      `)
      .eq('is_active', true)
    
    // Text search for mobile filter modal
    const search = searchParams.get('search')
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }
    
    console.log('Mobile locations API: Executing query')
    const { data, error } = await query.order('name', { ascending: true }).limit(5)
    
    if (error) {
      console.error('Error fetching mobile locations:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Mobile locations API: Found locations:', data?.length || 0)

    // Add property count for each location
    const locationsWithCount = await Promise.all(
      (data || []).map(async (location: Record<string, unknown>) => {
        try {
          const { count } = await supabase
            .from('properties')
            .select('*', { count: 'exact', head: true })
            .eq('location_id', location.id)
            .eq('status', 'active')
          
          return {
            ...location,
            property_count: count || 0
          }
        } catch (err) {
          console.warn(`Failed to fetch property count for location ${location.id}:`, err)
          return {
            ...location,
            property_count: 0
          }
        }
      })
    )
    
    console.log('Mobile locations API: Returning data')
    
    // Return mobile-optimized location data
    return NextResponse.json({
      locations: locationsWithCount,
      total: locationsWithCount.length,
      hasMore: locationsWithCount.length === 5 // If we got exactly 5, there might be more
    })
  } catch (error) {
    console.error('Unexpected error in mobile locations API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 