/**
 * Core SEO data interface for generating metadata
 */
export interface SEOData {
  title: string
  description: string
  keywords?: string[]
  canonical?: string
  ogImage?: string
  ogType?: 'website' | 'article' | 'product' | 'profile'
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
  structuredData?: Record<string, unknown>
  noIndex?: boolean
  noFollow?: boolean
}

/**
 * Property-specific SEO data
 */
export interface PropertySEOData extends SEOData {
  price?: number
  currency?: string
  location?: string
  propertyType?: string
  bedrooms?: number
  bathrooms?: number
  area?: number
  availability?: 'available' | 'sold' | 'rented'
  images?: string[]
}

/**
 * Blog/Article-specific SEO data
 */
export interface ArticleSEOData extends SEOData {
  author?: string
  publishDate?: string
  modifiedDate?: string
  category?: string
  tags?: string[]
  readingTime?: number
}

/**
 * Public listing-specific SEO data
 */
export interface PublicListingSEOData extends SEOData {
  listingType?: string
  publishDate?: string
  expireDate?: string
  featuredImage?: string
}

/**
 * Organization/Company SEO data
 */
export interface OrganizationSEOData extends SEOData {
  logo?: string
  contactInfo?: {
    phone?: string
    email?: string
    address?: string
  }
  socialProfiles?: {
    facebook?: string
    twitter?: string
    instagram?: string
    linkedin?: string
  }
}

/**
 * SEO configuration from settings
 */
export interface SEOConfig {
  siteName: string
  siteUrl: string
  defaultTitle: string
  defaultDescription: string
  defaultOgImage: string
  faviconUrl?: string
  twitterHandle?: string
  facebookAppId?: string
  googleSiteVerification?: string
  bingSiteVerification?: string
}

/**
 * Metadata generation options
 */
export interface MetadataOptions {
  includeStructuredData?: boolean
  includeOpenGraph?: boolean
  includeTwitter?: boolean
  includeCanonical?: boolean
  robots?: {
    index?: boolean
    follow?: boolean
    noarchive?: boolean
    nosnippet?: boolean
  }
}

/**
 * Structured data types for JSON-LD
 */
export interface StructuredData {
  '@context': string
  '@type': string
  [key: string]: unknown
}

export interface PropertyStructuredData extends StructuredData {
  '@type': 'RealEstateListing'
  name: string
  description: string
  url: string
  image?: string[]
  offers: {
    '@type': 'Offer'
    price: number
    priceCurrency: string
    availability: string
  }
  address: {
    '@type': 'PostalAddress'
    streetAddress?: string
    addressLocality: string
    addressRegion?: string
    postalCode?: string
    addressCountry: string
  }
  geo?: {
    '@type': 'GeoCoordinates'
    latitude: number
    longitude: number
  }
  numberOfRooms?: number
  numberOfBathroomsTotal?: number
  floorSize?: {
    '@type': 'QuantitativeValue'
    value: number
    unitCode: string
  }
  video?: {
    '@type': 'VideoObject'
    name: string
    description: string
    contentUrl: string
    embedUrl: string
    thumbnailUrl?: string
  }
}

export interface OrganizationStructuredData extends StructuredData {
  '@type': 'Organization'
  name: string
  url: string
  logo?: string
  description?: string
  contactPoint?: {
    '@type': 'ContactPoint'
    telephone?: string
    contactType: string
    email?: string
  }
  address?: {
    '@type': 'PostalAddress'
    streetAddress?: string
    addressLocality?: string
    addressRegion?: string
    postalCode?: string
    addressCountry?: string
  }
  sameAs?: string[]
}

export interface ArticleStructuredData extends StructuredData {
  '@type': 'Article'
  headline: string
  description: string
  url: string
  datePublished: string
  dateModified?: string
  author: {
    '@type': 'Person'
    name: string
  }
  publisher: {
    '@type': 'Organization'
    name: string
    logo?: string
  }
  image?: string
  mainEntityOfPage?: string
}
