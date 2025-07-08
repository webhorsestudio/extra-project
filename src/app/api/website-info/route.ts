import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = await createSupabaseAdminClient()
    const { data, error } = await supabase
      .from('settings')
      .select(`
        site_title,
        meta_description,
        logo_url,
        favicon_url,
        contact_email,
        contact_phone,
        contact_address,
        website_url,
        facebook_url,
        twitter_url,
        instagram_url,
        linkedin_url,
        youtube_url,
        tiktok_url,
        whatsapp_url
      `)
      .single()
    
    if (error) {
      console.error('Error fetching website info:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ website_info: data })
  } catch (error) {
    console.error('Unexpected error in website-info API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 