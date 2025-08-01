import { createSupabaseAdminUserClient, createSupabaseAdminClient } from './supabase/admin'

export interface Settings {
  id: string
  // Branding fields
  logo_url?: string
  logo_storage_path?: string
  favicon_url?: string
  favicon_storage_path?: string
  logo_alt_text?: string
  favicon_alt_text?: string
  default_og_image_url?: string
  default_og_image_storage_path?: string
  
  // SEO fields
  google_analytics_id?: string
  google_tag_manager_id?: string
  robots_txt?: string
  sitemap_schedule?: string
  sitemap_enabled?: boolean
  sitemap_include_properties?: boolean
  sitemap_include_users?: boolean
  sitemap_include_blog?: boolean
  
  // Theme fields
  primary_color?: string
  secondary_color?: string
  accent_color?: string
  font_family?: string
  font_size_base?: string
  border_radius?: string
  enable_dark_mode?: boolean
  enable_animations?: boolean
  enable_shadows?: boolean
  
  // Contact fields
  contact_email?: string
  contact_phone?: string
  contact_address?: string
  contact_website?: string
  
  // Website fields
  site_title?: string
  meta_description?: string
  website_url?: string
  facebook_url?: string
  twitter_url?: string
  instagram_url?: string
  linkedin_url?: string
  youtube_url?: string
  tiktok_url?: string
  whatsapp_url?: string
  
  // SMTP fields
  smtp_host?: string
  smtp_port?: number
  smtp_username?: string
  smtp_password?: string
  smtp_secure?: boolean
  email_from?: string
  email_from_name?: string
  signup_confirmation_subject?: string
  signup_confirmation_body?: string
  password_reset_subject?: string
  password_reset_body?: string
  email_confirmation_enabled?: boolean
  
  // Timestamps
  created_at?: string
  updated_at?: string
}

export async function getSettings(): Promise<Settings | null> {
  try {
    const supabase = await createSupabaseAdminUserClient()
    const SETTINGS_UUID = 'ed4ebb8c-40cd-4173-b492-fef97713217b';
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', SETTINGS_UUID)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found, return null
        return null
      }
      console.error('Error fetching settings:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching settings:', error)
    return null
  }
}

export async function createDefaultSettings(): Promise<Settings | null> {
  try {
    const supabase = await createSupabaseAdminUserClient()
    
    const defaultSettings = {
      site_title: '',
      meta_description: '',
      website_url: '',
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
      font_family: 'Inter',
      font_size_base: '16px',
      border_radius: '8px',
      enable_dark_mode: false,
      enable_animations: true,
      enable_shadows: true,
      sitemap_schedule: 'daily',
      sitemap_enabled: true,
      sitemap_include_properties: true,
      sitemap_include_users: false,
      sitemap_include_blog: true,
    }

    const { data, error } = await supabase
      .from('settings')
      .insert([defaultSettings])
      .select()
      .single()

    if (error) {
      console.error('Error creating default settings:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error creating default settings:', error)
    return null
  }
}

export async function updateSettings(updates: Partial<Settings>): Promise<Settings | null> {
  try {
    const supabase = await createSupabaseAdminClient()
    
    // First, get the existing settings to find the correct ID
    const { data: existingSettings, error: fetchError } = await supabase
      .from('settings')
      .select('id')
      .single()

    if (fetchError && fetchError.code === 'PGRST116') {
      // No settings found, create default settings first
      console.log('No settings found, creating default settings first...')
      const defaultSettings = await createDefaultSettings()
      if (!defaultSettings) {
        return null
      }
      
      // Now update the newly created settings
      const { data: updateData, error: updateError } = await supabase
        .from('settings')
        .update(updates)
        .eq('id', defaultSettings.id)
        .select()
        .single()
      
      if (updateError) {
        console.error('Error updating settings after creation:', updateError)
        return null
      }
      
      return updateData
    }

    if (fetchError) {
      console.error('Error fetching existing settings:', fetchError)
      return null
    }

    // Update settings using the correct UUID
    const { data, error } = await supabase
      .from('settings')
      .update(updates)
      .eq('id', existingSettings.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating settings:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error updating settings:', error)
    return null
  }
}

export async function getPublicSettings(): Promise<Partial<Settings> | null> {
  try {
    const supabase = await createSupabaseAdminUserClient()
    const { data, error } = await supabase
      .from('settings')
      .select(`
        site_title,
        meta_description,
        logo_url,
        logo_alt_text,
        favicon_url,
        default_og_image_url,
        primary_color,
        secondary_color,
        accent_color,
        font_family,
        font_size_base,
        border_radius,
        enable_dark_mode,
        enable_animations,
        enable_shadows,
        contact_email,
        contact_phone,
        contact_address,
        contact_website,
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
      console.error('Error fetching public settings:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching public settings:', error)
    return null
  }
} 