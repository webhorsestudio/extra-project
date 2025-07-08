import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = await createSupabaseAdminClient()
    
    // Fetch minimal footer data for mobile
    const { data, error } = await supabase
      .from('settings')
      .select(`
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
      console.error('Error fetching mobile footer data:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Return mobile-optimized footer data
    return NextResponse.json({
      contact: {
        email: data?.contact_email || '',
        phone: data?.contact_phone || '',
        address: data?.contact_address || ''
      },
      social: {
        facebook: data?.facebook_url || '',
        twitter: data?.twitter_url || '',
        instagram: data?.instagram_url || '',
        linkedin: data?.linkedin_url || '',
        youtube: data?.youtube_url || '',
        tiktok: data?.tiktok_url || '',
        whatsapp: data?.whatsapp_url || ''
      },
      website: data?.website_url || ''
    })
  } catch (error) {
    console.error('Unexpected error in mobile footer API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}