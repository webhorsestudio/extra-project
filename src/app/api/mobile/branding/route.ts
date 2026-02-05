import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = await createSupabaseAdminClient()
    
    // Fetch only essential branding data for mobile
    const { data, error } = await supabase
      .from('settings')
      .select(`
        logo_url,
        company_name,
        company_tagline,
        site_title
      `)
      .single()
    
    if (error) {
      console.error('Error fetching mobile branding data:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Return mobile-optimized branding data
    return NextResponse.json({
      logo_url: data?.logo_url || null,
      company_name: data?.company_name || 'Property',
      company_tagline: data?.company_tagline || 'Find your perfect home',
      site_title: data?.site_title || 'Property Search'
    })
  } catch (error) {
    console.error('Unexpected error in mobile branding API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 