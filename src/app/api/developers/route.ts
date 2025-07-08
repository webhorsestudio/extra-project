import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('property_developers')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ developers: data })
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseAdminClient()
    const { 
      name, 
      website, 
      address, 
      logo_url, 
      logo_storage_path, 
      contact_info, 
      is_active = true 
    } = await req.json()
    
    if (!name) {
      return NextResponse.json({ error: 'Developer name is required' }, { status: 400 })
    }
    
    const { data, error } = await supabase
      .from('property_developers')
      .insert([{ 
        name, 
        website, 
        address, 
        logo_url, 
        logo_storage_path, 
        contact_info, 
        is_active 
      }])
      .select()
      .single()
      
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ developer: data })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
} 