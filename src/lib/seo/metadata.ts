import { Metadata } from 'next'
import { SEOData, SEOConfig, MetadataOptions } from './types'

/**
 * Default SEO configuration
 */
const DEFAULT_SEO_CONFIG: SEOConfig = {
  siteName: 'Extra Realty Private Limited',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://extrarealtygroup.com',
  defaultTitle: 'Extra Realty - Explore all Premium Properties near you',
  defaultDescription: 'Discover the best homes for you & your family. Premium properties in Bangalore with modern amenities and excellent connectivity.',
  defaultOgImage: '/images/og-default.jpg',
  twitterHandle: '@extrarealty',
}

/**
 * Generate comprehensive metadata from SEO data
 */
export function generateMetadata(
  seoData: SEOData,
  config: SEOConfig = DEFAULT_SEO_CONFIG,
  options: MetadataOptions = {}
): Metadata {
  const {
    includeStructuredData = true,
    includeOpenGraph = true,
    includeTwitter = true,
    includeCanonical = true,
    robots = { index: true, follow: true }
  } = options

  // Handle noIndex/noFollow from SEO data
  const finalRobots = {
    ...robots,
    index: seoData.noIndex ? false : robots.index,
    follow: seoData.noFollow ? false : robots.follow,
  }

  const metadata: Metadata = {
    metadataBase: new URL(config.siteUrl),
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords?.join(', '),
    robots: finalRobots,
    alternates: {
      canonical: includeCanonical ? seoData.canonical || `${config.siteUrl}${seoData.canonical || ''}` : undefined,
    },
    icons: {
      icon: config.faviconUrl ? (config.faviconUrl.startsWith('http') ? config.faviconUrl : `${config.siteUrl}${config.faviconUrl}`) : '/favicon',
      shortcut: config.faviconUrl ? (config.faviconUrl.startsWith('http') ? config.faviconUrl : `${config.siteUrl}${config.faviconUrl}`) : '/favicon',
      apple: config.faviconUrl ? (config.faviconUrl.startsWith('http') ? config.faviconUrl : `${config.siteUrl}${config.faviconUrl}`) : '/favicon',
    },
  }

  // Add Open Graph metadata
  if (includeOpenGraph) {
    metadata.openGraph = {
      title: seoData.title,
      description: seoData.description,
      url: seoData.canonical || config.siteUrl,
      siteName: config.siteName,
      images: seoData.ogImage ? [
        {
          url: seoData.ogImage.startsWith('http') ? seoData.ogImage : `${config.siteUrl}${seoData.ogImage}`,
          width: 1200,
          height: 630,
          alt: seoData.title,
        }
      ] : [
        {
          url: seoData.ogImage || config.defaultOgImage,
          width: 1200,
          height: 630,
          alt: seoData.title,
        }
      ],
      type: (seoData.ogType === 'product' ? 'website' : seoData.ogType) || 'website',
      locale: 'en_US',
    }
  }

  // Add Twitter metadata
  if (includeTwitter) {
    metadata.twitter = {
      card: seoData.twitterCard || 'summary_large_image',
      title: seoData.title,
      description: seoData.description,
      images: seoData.ogImage ? [seoData.ogImage] : [config.defaultOgImage],
      creator: config.twitterHandle,
      site: config.twitterHandle,
    }
  }

  // Add structured data
  if (includeStructuredData && seoData.structuredData) {
    metadata.other = {
      'application/ld+json': JSON.stringify(seoData.structuredData),
    }
  }

  return metadata
}

/**
 * Generate property-specific metadata
 */
export function generatePropertyMetadata(
  property: {
    title: string
    description: string
    location: string
    property_type: string
    price?: number
    bedrooms?: number
    bathrooms?: number
    area?: number
    images?: string[]
    id: string
  },
  config: SEOConfig = DEFAULT_SEO_CONFIG
): Metadata {
  const priceText = property.price ? `₹${property.price.toLocaleString()}` : 'Price on Request'
  const title = `${property.title} - ${priceText} | ${property.location}`
  
  const description = property.description.length > 150 
    ? `${property.description.substring(0, 147)}...`
    : property.description

  const seoData: SEOData = {
    title,
    description,
    keywords: [
      property.property_type.toLowerCase(),
      property.location.toLowerCase(),
      'real estate',
      'property for sale',
      'apartment',
      'house',
      'bangalore properties'
    ],
    canonical: `/properties/${property.id}`,
    ogImage: property.images?.[0] || config.defaultOgImage,
    ogType: 'product',
    twitterCard: 'summary_large_image',
  }

  return generateMetadata(seoData, config)
}

/**
 * Generate blog/article metadata
 */
export function generateArticleMetadata(
  article: {
    title: string
    excerpt: string
    featured_image?: string
    author?: string
    created_at: string
    updated_at?: string
    categories?: string[]
    slug: string
  },
  config: SEOConfig = DEFAULT_SEO_CONFIG
): Metadata {
  const seoData: SEOData = {
    title: article.title,
    description: article.excerpt,
    keywords: [
      'real estate blog',
      'property news',
      'bangalore real estate',
      ...(article.categories || [])
    ],
    canonical: `/blog/${article.slug}`,
    ogImage: article.featured_image || config.defaultOgImage,
    ogType: 'article',
    twitterCard: 'summary_large_image',
  }

  return generateMetadata(seoData, config)
}

/**
 * Generate public listing metadata
 */
export function generatePublicListingMetadata(
  listing: {
    title: string
    excerpt?: string
    content: unknown
    featured_image_url?: string
    slug: string
    type: string
    created_at: string
  },
  config: SEOConfig = DEFAULT_SEO_CONFIG
): Metadata {
  // Extract description from content if excerpt is not available
  let description = listing.excerpt
  if (!description && listing.content) {
    // Simple text extraction from JSON content
    const textContent = extractTextFromContent(listing.content)
    description = textContent.length > 150 
      ? `${textContent.substring(0, 147)}...`
      : textContent
  }

  const seoData: SEOData = {
    title: listing.title,
    description: description || 'Latest property updates and announcements',
    keywords: [
      'property news',
      'real estate updates',
      'bangalore properties',
      listing.type.toLowerCase(),
    ],
    canonical: `/public-listings/${listing.slug}`,
    ogImage: listing.featured_image_url || config.defaultOgImage,
    ogType: 'article',
    twitterCard: 'summary_large_image',
  }

  return generateMetadata(seoData, config)
}

/**
 * Generate home page metadata
 */
export function generateHomeMetadata(
  featuredProperties: unknown[] = [],
  config: SEOConfig = DEFAULT_SEO_CONFIG
): Metadata {
  const propertyCount = featuredProperties.length
  const title = propertyCount > 0 
    ? `${config.defaultTitle} - ${propertyCount}+ Premium Properties`
    : config.defaultTitle

  const seoData: SEOData = {
    title,
    description: config.defaultDescription,
    keywords: [
      'real estate bangalore',
      'premium properties',
      'apartments for sale',
      'houses for sale',
      'property investment',
      'bangalore real estate market'
    ],
    canonical: '/',
    ogImage: config.defaultOgImage,
    ogType: 'website',
    twitterCard: 'summary_large_image',
  }

  return generateMetadata(seoData, config)
}

/**
 * Extract text content from JSON content structure
 */
function extractTextFromContent(content: unknown): string {
  if (typeof content === 'string') {
    return content
  }

  if (Array.isArray(content)) {
    return content.map(extractTextFromContent).join(' ')
  }

  if (content && typeof content === 'object') {
    const contentObj = content as Record<string, unknown>
    if (contentObj.text) {
      return contentObj.text as string
    }
    if (contentObj.content) {
      return extractTextFromContent(contentObj.content)
    }
    // Handle other object structures
    return Object.values(content)
      .map(extractTextFromContent)
      .join(' ')
  }

  return ''
}

/**
 * Generate canonical URL
 */
export function generateCanonicalUrl(path: string, config: SEOConfig = DEFAULT_SEO_CONFIG): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${config.siteUrl}${cleanPath}`
}

/**
 * Generate meta keywords from content
 */
export function generateKeywords(content: string, additionalKeywords: string[] = []): string[] {
  const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an']
  
  const words = content
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.includes(word))
    .slice(0, 10) // Limit to 10 keywords

  return [...new Set([...words, ...additionalKeywords])]
}
