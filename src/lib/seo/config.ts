import { createSupabaseAdminUserClient } from '@/lib/supabase/admin'
import { SEOConfig } from './types'

/**
 * Default SEO configuration fallback
 */
export const DEFAULT_SEO_CONFIG: SEOConfig = {
  siteName: 'Extra Realty Private Limited',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://extrarealtygroup.com',
  defaultTitle: 'Extra Realty Group - Explore all Premium Properties near you',
  defaultDescription: 'Discover the best homes for you & your family. Explore all Premium properties near you with modern amenities and excellent connectivity.',
  defaultOgImage: '/images/og-default.jpg',
  faviconUrl: '/favicon',
  twitterHandle: '@extrarealty',
}

/**
 * Fetch SEO configuration from database
 */
export async function getSEOConfig(): Promise<SEOConfig> {
  try {
    const supabase = await createSupabaseAdminUserClient()
    
    const { data: settings, error } = await supabase
      .from('settings')
      .select(`
        site_title,
        meta_description,
        site_url,
        website_url,
        facebook_url,
        twitter_url,
        instagram_url,
        linkedin_url,
        contact_email,
        contact_phone,
        contact_address,
        default_og_image_url,
        favicon_url,
        google_site_verification,
        bing_site_verification
      `)
      .single()

    if (error) {
      console.warn('Failed to fetch SEO settings, using defaults:', error.message)
      return DEFAULT_SEO_CONFIG
    }

    if (!settings) {
      return DEFAULT_SEO_CONFIG
    }

    // Extract social profiles
    const socialProfiles = {
      facebook: settings.facebook_url,
      twitter: settings.twitter_url,
      instagram: settings.instagram_url,
      linkedin: settings.linkedin_url,
    }

    // Extract Twitter handle from URL
    let twitterHandle = DEFAULT_SEO_CONFIG.twitterHandle
    if (settings.twitter_url) {
      const twitterMatch = settings.twitter_url.match(/twitter\.com\/([^\/\?]+)/)
      if (twitterMatch) {
        twitterHandle = `@${twitterMatch[1]}`
      }
    }

    return {
      siteName: settings.site_title || DEFAULT_SEO_CONFIG.siteName,
      siteUrl: settings.site_url || settings.website_url || DEFAULT_SEO_CONFIG.siteUrl,
      defaultTitle: settings.site_title || DEFAULT_SEO_CONFIG.defaultTitle,
      defaultDescription: settings.meta_description || DEFAULT_SEO_CONFIG.defaultDescription,
      defaultOgImage: settings.default_og_image_url || DEFAULT_SEO_CONFIG.defaultOgImage,
      faviconUrl: settings.favicon_url,
      twitterHandle,
      facebookAppId: socialProfiles.facebook,
      googleSiteVerification: settings.google_site_verification,
      bingSiteVerification: settings.bing_site_verification,
    }
  } catch (error) {
    console.warn('Error fetching SEO config:', error)
    return DEFAULT_SEO_CONFIG
  }
}

/**
 * Get organization data for structured data
 */
export async function getOrganizationData(): Promise<{
  name: string
  description?: string
  logo?: string
  phone?: string
  email?: string
  address?: string
  socialProfiles?: {
    facebook?: string
    twitter?: string
    instagram?: string
    linkedin?: string
  }
}> {
  try {
    const supabase = await createSupabaseAdminUserClient()
    
    const { data: settings, error } = await supabase
      .from('settings')
      .select(`
        site_title,
        meta_description,
        logo_url,
        contact_email,
        contact_phone,
        contact_address,
        facebook_url,
        twitter_url,
        instagram_url,
        linkedin_url
      `)
      .single()

    if (error || !settings) {
      return {
        name: DEFAULT_SEO_CONFIG.siteName,
        description: DEFAULT_SEO_CONFIG.defaultDescription,
      }
    }

    return {
      name: settings.site_title || DEFAULT_SEO_CONFIG.siteName,
      description: settings.meta_description || DEFAULT_SEO_CONFIG.defaultDescription,
      logo: settings.logo_url,
      phone: settings.contact_phone,
      email: settings.contact_email,
      address: settings.contact_address,
      socialProfiles: {
        facebook: settings.facebook_url,
        twitter: settings.twitter_url,
        instagram: settings.instagram_url,
        linkedin: settings.linkedin_url,
      },
    }
  } catch (error) {
    console.warn('Error fetching organization data:', error)
    return {
      name: DEFAULT_SEO_CONFIG.siteName,
      description: DEFAULT_SEO_CONFIG.defaultDescription,
    }
  }
}

/**
 * Validate SEO configuration
 */
export function validateSEOConfig(config: SEOConfig): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Required fields
  if (!config.siteName) {
    errors.push('Site name is required')
  }

  if (!config.siteUrl) {
    errors.push('Site URL is required')
  }

  if (!config.defaultTitle) {
    errors.push('Default title is required')
  }

  if (!config.defaultDescription) {
    errors.push('Default description is required')
  }

  // URL validation
  if (config.siteUrl && !isValidUrl(config.siteUrl)) {
    errors.push('Site URL must be a valid URL')
  }

  // Title length validation
  if (config.defaultTitle && config.defaultTitle.length > 60) {
    warnings.push('Default title is longer than recommended 60 characters')
  }

  // Description length validation
  if (config.defaultDescription && config.defaultDescription.length > 160) {
    warnings.push('Default description is longer than recommended 160 characters')
  }

  // Twitter handle validation
  if (config.twitterHandle && !config.twitterHandle.startsWith('@')) {
    warnings.push('Twitter handle should start with @')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Check if URL is valid
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Generate robots.txt content
 */
export async function generateRobotsTxt(): Promise<string> {
  try {
    const supabase = await createSupabaseAdminUserClient()
    
    const { data: settings, error } = await supabase
      .from('settings')
      .select('robots_txt, site_url')
      .single()

    if (error || !settings) {
      return generateDefaultRobotsTxt()
    }

    // If custom robots.txt is provided, use it
    if (settings.robots_txt) {
      return settings.robots_txt
    }

    // Generate default robots.txt
    return generateDefaultRobotsTxt(settings.site_url)
  } catch (error) {
    console.warn('Error generating robots.txt:', error)
    return generateDefaultRobotsTxt()
  }
}

/**
 * Generate default robots.txt content
 */
function generateDefaultRobotsTxt(siteUrl?: string): string {
  const baseUrl = siteUrl || DEFAULT_SEO_CONFIG.siteUrl
  
  return `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml

# Disallow admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /users/
Disallow: /wishlist/

# Allow important pages
Allow: /properties/
Allow: /public-listings/
Allow: /blog/
Allow: /m/properties/
Allow: /m/public-listings/

# Crawl delay
Crawl-delay: 1`
}
