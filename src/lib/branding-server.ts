import { createSupabaseServerClientSafe } from '@/lib/supabase/server-fallback'

export interface LogoInfo {
  logo_url: string | null
  logo_alt_text: string
  logo_storage_path: string | null
  has_logo: boolean
}

export interface BrandingData {
  logo_url: string | null
  logo_alt: string
  company_name: string
  company_tagline: string
}

export async function getLogoInfo(): Promise<LogoInfo> {
  try {
    // Dynamic import to avoid SSR issues
    const { createSupabaseAdminClient } = await import('./supabase/admin')
    const supabase = await createSupabaseAdminClient()
    const { data, error } = await supabase
      .from('settings')
      .select('logo_url, logo_alt_text, logo_storage_path')
      .single()

    if (error) {
      console.error('Error fetching logo info:', error)
      return {
        logo_url: null,
        logo_alt_text: 'Company Logo',
        logo_storage_path: null,
        has_logo: false
      }
    }

    return {
      logo_url: data?.logo_url || null,
      logo_alt_text: data?.logo_alt_text || 'Company Logo',
      logo_storage_path: data?.logo_storage_path || null,
      has_logo: !!data?.logo_url
    }
  } catch (error) {
    console.error('Unexpected error fetching logo info:', error)
    return {
      logo_url: null,
      logo_alt_text: 'Company Logo',
      logo_storage_path: null,
      has_logo: false
    }
  }
}

export async function getLogoImage(): Promise<{ imageBuffer: ArrayBuffer | null; contentType: string | null; error: string | null }> {
  try {
    const logoInfo = await getLogoInfo()
    
    if (!logoInfo.has_logo || !logoInfo.logo_url) {
      console.log('Branding: No logo configured')
      return { imageBuffer: null, contentType: null, error: 'No logo configured' }
    }

    // Check if the URL is valid
    if (!logoInfo.logo_url.startsWith('http://') && !logoInfo.logo_url.startsWith('https://')) {
      console.log('Branding: Invalid logo URL format:', logoInfo.logo_url)
      return { imageBuffer: null, contentType: null, error: 'Invalid logo URL format' }
    }

    // Fetch the image from the URL
    const imageResponse = await fetch(logoInfo.logo_url)
    
    if (!imageResponse.ok) {
      console.error('Error fetching logo image:', imageResponse.statusText)
      return { imageBuffer: null, contentType: null, error: 'Failed to fetch logo image' }
    }

    // Get the image data and content type
    const imageBuffer = await imageResponse.arrayBuffer()
    const contentType = imageResponse.headers.get('content-type') || 'image/png'

    return { imageBuffer, contentType, error: null }
  } catch (error) {
    console.error('Unexpected error fetching logo image:', error)
    return { imageBuffer: null, contentType: null, error: 'Internal server error' }
  }
}

export async function getBrandingData(): Promise<BrandingData> {
  try {
    const supabase = await createSupabaseServerClientSafe()
    
    // First, try to fetch logo data from settings table
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('logo_url, logo_alt_text, site_title')
      .single()
    
    if (!settingsError && settings?.logo_url) {
      // Found logo in settings table
      return {
        logo_url: settings.logo_url,
        logo_alt: settings.logo_alt_text || 'Extra Realty',
        company_name: settings.site_title || 'Extra Realty Private Limited',
        company_tagline: 'Empowering Real Estate Excellence'
      }
    }
    
    // If no logo in settings, try footer_logo table as fallback
    const { data: footerLogo, error: footerError } = await supabase
      .from('footer_logo')
      .select('logo_url, logo_alt_text')
      .eq('is_active', true)
      .single()
    
    if (!footerError && footerLogo?.logo_url) {
      // Found logo in footer_logo table
      return {
        logo_url: footerLogo.logo_url,
        logo_alt: footerLogo.logo_alt_text || 'Extra Realty',
        company_name: 'Extra Realty Private Limited',
        company_tagline: 'Empowering Real Estate Excellence'
      }
    }
    
    // Return default branding data if no logo found
    return {
      logo_url: null,
      logo_alt: 'Extra Realty',
      company_name: 'Extra Realty Private Limited',
      company_tagline: 'Empowering Real Estate Excellence'
    }
  } catch (error) {
    console.error('Error fetching branding data:', error)
    
    // Return default branding data on error
    return {
      logo_url: null,
      logo_alt: 'Extra Realty',
      company_name: 'Extra Realty Private Limited',
      company_tagline: 'Empowering Real Estate Excellence'
    }
  }
} 