import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('property_amenities')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ amenities: data })
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseAdminClient()
  const { name, image_url, image_storage_path, is_active = true } = await req.json()
  if (!name) {
    return NextResponse.json({ error: 'Amenity name is required' }, { status: 400 })
  }
  const { data, error } = await supabase
    .from('property_amenities')
    .insert([{ name, image_url, image_storage_path, is_active }])
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ amenity: data })
}