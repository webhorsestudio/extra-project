import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    console.log('Public Settings API: Starting GET request')
    
    const supabase = await createSupabaseAdminClient()
    const { data, error } = await supabase
      .from('settings')
      .select('google_analytics_id, google_tag_manager_id, meta_pixel_id')
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found, return empty tracking settings
        console.log('Public Settings API: No settings found, returning empty tracking settings')
        return NextResponse.json({ 
          settings: {
            google_analytics_id: '',
            google_tag_manager_id: ''
          }
        })
      }
      
      console.error('Public Settings API: Error fetching settings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch tracking settings' },
        { status: 500 }
      )
    }

    console.log('Public Settings API: Successfully fetched tracking settings')
    return NextResponse.json({ 
      settings: {
        google_analytics_id: data.google_analytics_id || '',
        google_tag_manager_id: data.google_tag_manager_id || '',
        meta_pixel_id: data.meta_pixel_id || ''
      }
    })
  } catch (error) {
    console.error('Public Settings API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 