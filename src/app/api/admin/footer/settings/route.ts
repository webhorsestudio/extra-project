import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseApiClient } from '@/lib/supabase/api'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseApiClient()
    
    // Get the active footer settings
    const { data: settings, error } = await supabase
      .from('footer_settings')
      .select('*')
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Footer settings API: Error fetching settings:', error)
      return NextResponse.json({ error: 'Failed to fetch footer settings' }, { status: 500 })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Footer settings API: Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication first
    const supabase = await createSupabaseApiClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Footer settings API: Authentication error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      console.error('Footer settings API: User is not admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const adminSupabase = await createSupabaseAdminClient()
    const settingsData = await request.json()
    
    // Validate required fields
    if (typeof settingsData.footer_enabled !== 'boolean') {
      return NextResponse.json({ error: 'Footer enabled status is required' }, { status: 400 })
    }

    // Deactivate all existing settings
    await adminSupabase
      .from('footer_settings')
      .update({ is_active: false })
      .eq('is_active', true)

    // Create new settings
    const { data, error } = await adminSupabase
      .from('footer_settings')
      .insert([{
        footer_enabled: settingsData.footer_enabled,
        footer_position: settingsData.footer_position || 'bottom',
        footer_behavior: settingsData.footer_behavior || 'normal',
        footer_width: settingsData.footer_width || 'full',
        max_width: settingsData.max_width || 'max-w-7xl',
        show_on_mobile: settingsData.show_on_mobile ?? true,
        show_on_tablet: settingsData.show_on_tablet ?? true,
        show_on_desktop: settingsData.show_on_desktop ?? true,
        mobile_collapsible: settingsData.mobile_collapsible ?? false,
        tablet_collapsible: settingsData.tablet_collapsible ?? false,
        lazy_load: settingsData.lazy_load ?? false,
        preload_critical: settingsData.preload_critical ?? true,
        cache_duration: settingsData.cache_duration || 3600,
        enable_analytics: settingsData.enable_analytics ?? true,
        structured_data: settingsData.structured_data ?? true,
        schema_type: settingsData.schema_type || 'Organization',
        enable_aria_labels: settingsData.enable_aria_labels ?? true,
        skip_to_content: settingsData.skip_to_content ?? true,
        focus_indicators: settingsData.focus_indicators ?? true,
        google_analytics_id: settingsData.google_analytics_id,
        facebook_pixel_id: settingsData.facebook_pixel_id,
        hotjar_id: settingsData.hotjar_id,
        custom_tracking_code: settingsData.custom_tracking_code,
        custom_css: settingsData.custom_css,
        custom_js: settingsData.custom_js,
        enable_debug_mode: settingsData.enable_debug_mode ?? false,
        enable_console_logs: settingsData.enable_console_logs ?? false,
        enable_performance_monitoring: settingsData.enable_performance_monitoring ?? false,
        backup_settings: settingsData.backup_settings ?? true,
        auto_backup_frequency: settingsData.auto_backup_frequency || 'weekly',
        settings_version: settingsData.settings_version || '1.0.0',
        backup_retention_days: settingsData.backup_retention_days || 30,
        is_active: true
      }])
      .select()
      .single()

    if (error) {
      console.error('Footer settings API: Error creating settings:', error)
      return NextResponse.json({ error: 'Failed to save footer settings' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Footer settings saved successfully',
      settings: data 
    })
  } catch (error) {
    console.error('Footer settings API: Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 