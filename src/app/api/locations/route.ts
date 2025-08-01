import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseAdminClient()
    const { searchParams } = new URL(req.url)
    
    let query = supabase.from('property_locations').select('*')
    
    // Text search - improved to handle partial matches
    const search = searchParams.get('search')
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }
    
    // Check if this is an admin request (for management) or public request
    const isAdminRequest = searchParams.get('admin') === 'true'
    
    // Only filter by active status for public requests, not admin requests
    if (!isAdminRequest) {
      query = query.eq('is_active', true)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Add property count for each location in a single query
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
    
    return NextResponse.json({ 
      locations: locationsWithCount,
      total: locationsWithCount.length
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseAdminClient()
    const { name, description, image_url, image_storage_path } = await req.json()
    
    if (!name) {
      return NextResponse.json({ error: 'Location name is required' }, { status: 400 })
    }
    
    const { data, error } = await supabase
      .from('property_locations')
      .insert([{ name, description, image_url, image_storage_path }])
      .select()
      .single()
      
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ location: data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
