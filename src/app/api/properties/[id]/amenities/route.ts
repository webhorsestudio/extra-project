import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseApiClient } from '@/lib/supabase/api'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseApiClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params
    const result = await supabase
      .from('property_amenity_relations')
      .select(`
        id,
        amenity_id,
        created_at,
        property_amenities(
          id,
          name,
          image_url,
          image_storage_path,
          is_active
        )
      `)
      .eq('property_id', id)
    
    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }
    
    return NextResponse.json(result.data)
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseApiClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { amenity_ids } = await request.json()
    const { id } = await params
    if (!amenity_ids || !Array.isArray(amenity_ids)) {
      return NextResponse.json(
        { error: 'amenity_ids array is required' },
        { status: 400 }
      )
    }
    const { error: deleteError } = await supabase
      .from('property_amenity_relations')
      .delete()
      .eq('property_id', id)
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }
    const relations = amenity_ids.map((amenity_id: string) => ({
      property_id: id,
      amenity_id
    }))
    const insertResult = await supabase
      .from('property_amenity_relations')
      .insert(relations)
      .select()
    
    if (insertResult.error) {
      return NextResponse.json({ error: insertResult.error.message }, { status: 500 })
    }
    
    return NextResponse.json(insertResult.data)
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 