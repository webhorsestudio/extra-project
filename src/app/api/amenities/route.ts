import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseApiClient } from '@/lib/supabase/api'

export async function GET() {
  try {
    const supabase = await createSupabaseApiClient()
    const { data, error } = await supabase
      .from('property_amenities')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Amenities API error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log('Amenities API: Fetched', data?.length || 0, 'amenities')
    return NextResponse.json({ amenities: data || [] })
  } catch (error) {
    console.error('Amenities API exception:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseApiClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { name, image_url, image_storage_path, is_active = true } = await req.json()
    if (!name) {
      return NextResponse.json({ error: 'Amenity name is required' }, { status: 400 })
    }
    
    const { data, error } = await supabase
      .from('property_amenities')
      .insert([{ name, image_url, image_storage_path, is_active }])
      .select()
      .single()
    
    if (error) {
      console.error('Amenities POST error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ amenity: data })
  } catch (error) {
    console.error('Amenities POST exception:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}