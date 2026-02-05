import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    console.log('Settings API: Starting GET request')
    
    const supabase = await createSupabaseAdminClient()
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found, create default settings
        console.log('Settings API: No settings found, creating default settings')
        const defaultSettings = {
          site_title: '',
          meta_description: '',
          website_url: '',
          site_url: '',
          facebook_url: '',
          twitter_url: '',
          instagram_url: '',
          linkedin_url: '',
          youtube_url: '',
          tiktok_url: '',
          whatsapp_url: '',
          default_og_image_url: '',
          default_og_image_storage_path: '',
          primary_color: '#0ea5e9',
          secondary_color: '#f8fafc',
          accent_color: '#06b6d4',
          font_size_base: '16px',
          border_radius: '8px',
          enable_dark_mode: false,
          enable_animations: true,
          enable_shadows: true,
          google_analytics_id: '',
          google_tag_manager_id: '',
          meta_pixel_id: '',
          robots_txt: '',
          sitemap_schedule: 'daily',
          sitemap_enabled: true,
          sitemap_include_properties: true,
          sitemap_include_users: false,
          sitemap_include_blog: true,
        }
        
        const { data: newSettings, error: createError } = await supabase
          .from('settings')
          .insert([defaultSettings])
          .select()
          .single()
        
        if (createError) {
          console.error('Settings API: Failed to create default settings:', createError)
          return NextResponse.json(
            { error: 'Failed to initialize settings' },
            { status: 500 }
          )
        }
        
        console.log('Settings API: Successfully created default settings')
        return NextResponse.json({ settings: newSettings })
      }
      
      console.error('Settings API: Error fetching settings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch settings' },
        { status: 500 }
      )
    }

    console.log('Settings API: Successfully fetched settings')
    return NextResponse.json({ settings: data })
  } catch (error) {
    console.error('Settings API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updates = await request.json()
    console.log('Settings API: Updating settings with:', updates)

    const supabase = await createSupabaseAdminClient()
    
    // First check if settings exist
    const { data: existingSettings, error: fetchError } = await supabase
      .from('settings')
      .select('id')
      .single()

    if (fetchError && fetchError.code === 'PGRST116') {
      // No settings found, create default settings first
      console.log('Settings API: No settings found, creating default settings')
      const defaultSettings = {
        site_title: '',
        meta_description: '',
        website_url: '',
        site_url: '',
        facebook_url: '',
        twitter_url: '',
        instagram_url: '',
        linkedin_url: '',
        youtube_url: '',
        tiktok_url: '',
        whatsapp_url: '',
        default_og_image_url: '',
        default_og_image_storage_path: '',
        primary_color: '#0ea5e9',
        secondary_color: '#f8fafc',
        accent_color: '#06b6d4',
        font_size_base: '16px',
        border_radius: '8px',
        enable_dark_mode: false,
        enable_animations: true,
        enable_shadows: true,
        google_analytics_id: '',
        google_tag_manager_id: '',
        meta_pixel_id: '',
        robots_txt: '',
        sitemap_schedule: 'daily',
        sitemap_enabled: true,
        sitemap_include_properties: true,
        sitemap_include_users: false,
        sitemap_include_blog: true,
      }
      
      const { data: newSettings, error: createError } = await supabase
        .from('settings')
        .insert([defaultSettings])
        .select()
        .single()
      
      if (createError) {
        console.error('Settings API: Failed to create default settings:', createError)
        return NextResponse.json(
          { error: 'Failed to initialize settings' },
          { status: 500 }
        )
      }
      
      // Now update the newly created settings
      const { data: updateData, error: updateError } = await supabase
        .from('settings')
        .update(updates)
        .eq('id', newSettings.id)
        .select()
        .single()
      
      if (updateError) {
        console.error('Settings API: Failed to update settings after creation:', updateError)
        return NextResponse.json(
          { error: 'Failed to update settings' },
          { status: 500 }
        )
      }
      
      console.log('Settings API: Settings updated successfully')
      return NextResponse.json({ settings: updateData })
    }

    if (fetchError) {
      console.error('Settings API: Error fetching existing settings:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch settings' },
        { status: 500 }
      )
    }

    // Update settings using the correct UUID
    const { data, error } = await supabase
      .from('settings')
      .update(updates)
      .eq('id', existingSettings.id)
      .select()
      .single()

    if (error) {
      console.error('Settings API: Failed to update settings:', error)
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      )
    }

    console.log('Settings API: Settings updated successfully')
    return NextResponse.json({ settings: data })
  } catch (error) {
    console.error('Settings API: Error updating settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
