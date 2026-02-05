import { createSupabaseClient } from '@/lib/supabase/client'
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
 * Fetch SEO configuration from database (client-side)
 */
export async function getSEOConfigClient(): Promise<SEOConfig> {
  try {
    const supabase = createSupabaseClient()
    
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
 * Get organization data for structured data (client-side)
 */
export async function getOrganizationDataClient(): Promise<{
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
    const supabase = createSupabaseClient()
    
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
