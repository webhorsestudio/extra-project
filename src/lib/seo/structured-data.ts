import {
  StructuredData,
  PropertyStructuredData,
  OrganizationStructuredData,
  ArticleStructuredData,
  SEOConfig
} from './types'

const DEFAULT_SEO_CONFIG: SEOConfig = {
  siteName: 'Extra Realty Private Limited',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://extrarealtygroup.com',
  defaultTitle: 'Extra Realty Group - Explore all Premium Properties near you',
  defaultDescription: 'Discover the best homes for you & your family. Explore all Premium properties near you with modern amenities and excellent connectivity.',
  defaultOgImage: '/images/og-default.jpg',
  twitterHandle: '@extrarealty',
}

/**
 * Generate property structured data (JSON-LD)
 */
export function generatePropertyStructuredData(
  property: {
    id: string
    title: string
    description: string
    location: string
    property_type: string
    price?: number
    bedrooms?: number
    bathrooms?: number
    area?: number
    latitude?: number
    longitude?: number
    video_url?: string | null
    images?: string[]
    status?: string
    created_at: string
    updated_at: string
    slug?: string
  },
  config: SEOConfig = DEFAULT_SEO_CONFIG
): PropertyStructuredData {
  const baseUrl = config.siteUrl
  const propertyUrl = `${baseUrl}/properties/${property.slug || property.id}`
  
  const structuredData: PropertyStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    url: propertyUrl,
    image: property.images?.map(img => 
      img.startsWith('http') ? img : `${baseUrl}${img}`
    ) || [],
    offers: {
      '@type': 'Offer',
      price: property.price || 0,
      priceCurrency: 'INR',
      availability: property.status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.location,
      addressCountry: 'IN',
    },
  }

  // Add video URL if available
  if (property.video_url) {
    structuredData.video = {
      '@type': 'VideoObject',
      name: `${property.title} - Property Video`,
      description: `Video showcasing ${property.title} in ${property.location}`,
      contentUrl: property.video_url,
      embedUrl: property.video_url,
      thumbnailUrl: property.images?.[0] || undefined,
    }
  }

  // Add geo coordinates if available
  if (property.latitude && property.longitude) {
    structuredData.geo = {
      '@type': 'GeoCoordinates',
      latitude: property.latitude,
      longitude: property.longitude,
    }
  }

  // Add room information
  if (property.bedrooms) {
    structuredData.numberOfRooms = property.bedrooms
  }

  if (property.bathrooms) {
    structuredData.numberOfBathroomsTotal = property.bathrooms
  }

  // Add floor size
  if (property.area) {
    structuredData.floorSize = {
      '@type': 'QuantitativeValue',
      value: property.area,
      unitCode: 'SQM', // Square meters
    }
  }

  return structuredData
}

/**
 * Generate organization structured data
 */
export function generateOrganizationStructuredData(
  organization: {
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
  },
  config: SEOConfig = DEFAULT_SEO_CONFIG
): OrganizationStructuredData {
  const baseUrl = config.siteUrl
  
  const structuredData: OrganizationStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: organization.name,
    url: baseUrl,
    description: organization.description || config.defaultDescription,
  }

  // Add logo
  if (organization.logo) {
    structuredData.logo = organization.logo.startsWith('http') 
      ? organization.logo 
      : `${baseUrl}${organization.logo}`
  }

  // Add contact information
  if (organization.phone || organization.email) {
    structuredData.contactPoint = {
      '@type': 'ContactPoint',
      contactType: 'customer service',
    }

    if (organization.phone) {
      structuredData.contactPoint.telephone = organization.phone
    }

    if (organization.email) {
      structuredData.contactPoint.email = organization.email
    }
  }

  // Add address
  if (organization.address) {
    structuredData.address = {
      '@type': 'PostalAddress',
      streetAddress: organization.address,
      addressCountry: 'IN',
    }
  }

  // Add social profiles
  if (organization.socialProfiles) {
    const sameAs: string[] = []
    
    if (organization.socialProfiles.facebook) {
      sameAs.push(organization.socialProfiles.facebook)
    }
    if (organization.socialProfiles.twitter) {
      sameAs.push(organization.socialProfiles.twitter)
    }
    if (organization.socialProfiles.instagram) {
      sameAs.push(organization.socialProfiles.instagram)
    }
    if (organization.socialProfiles.linkedin) {
      sameAs.push(organization.socialProfiles.linkedin)
    }

    if (sameAs.length > 0) {
      structuredData.sameAs = sameAs
    }
  }

  return structuredData
}

/**
 * Generate article structured data
 */
export function generateArticleStructuredData(
  article: {
    title: string
    description: string
    slug: string
    author?: string
    created_at: string
    updated_at?: string
    featured_image?: string
    categories?: string[]
  },
  config: SEOConfig = DEFAULT_SEO_CONFIG
): ArticleStructuredData {
  const baseUrl = config.siteUrl
  const articleUrl = `${baseUrl}/blog/${article.slug}`
  
  const structuredData: ArticleStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    url: articleUrl,
    datePublished: new Date(article.created_at).toISOString(),
    author: {
      '@type': 'Person',
      name: article.author || 'Extra Realty Team',
    },
    publisher: {
      '@type': 'Organization',
      name: config.siteName,
      logo: config.defaultOgImage,
    },
    mainEntityOfPage: articleUrl,
  }

  // Add modified date if available
  if (article.updated_at) {
    structuredData.dateModified = new Date(article.updated_at).toISOString()
  }

  // Add featured image
  if (article.featured_image) {
    structuredData.image = article.featured_image.startsWith('http') 
      ? article.featured_image 
      : `${baseUrl}${article.featured_image}`
  }

  return structuredData
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(
  breadcrumbs: Array<{
    name: string
    url: string
  }>,
  config: SEOConfig = DEFAULT_SEO_CONFIG
): StructuredData {
  const baseUrl = config.siteUrl
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url.startsWith('http') ? crumb.url : `${baseUrl}${crumb.url}`,
    })),
  }
}

/**
 * Generate FAQ structured data
 */
export function generateFAQStructuredData(
  faqs: Array<{
    question: string
    answer: string
  }>
): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

/**
 * Generate local business structured data
 */
export function generateLocalBusinessStructuredData(
  business: {
    name: string
    description?: string
    address: string
    phone?: string
    email?: string
    website?: string
    latitude?: number
    longitude?: number
    openingHours?: string[]
    priceRange?: string
  },
  config: SEOConfig = DEFAULT_SEO_CONFIG
): StructuredData {
  const baseUrl = config.siteUrl
  
  const structuredData: StructuredData = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: business.name,
    description: business.description || 'Premium real estate services in Bangalore',
    url: business.website || baseUrl,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address,
      addressCountry: 'IN',
    },
  }

  // Add contact information
  if (business.phone) {
    structuredData.telephone = business.phone
  }

  if (business.email) {
    structuredData.email = business.email
  }

  // Add geo coordinates
  if (business.latitude && business.longitude) {
    structuredData.geo = {
      '@type': 'GeoCoordinates',
      latitude: business.latitude,
      longitude: business.longitude,
    }
  }

  // Add opening hours
  if (business.openingHours && business.openingHours.length > 0) {
    structuredData.openingHoursSpecification = business.openingHours.map(hours => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: hours,
      opens: '09:00',
      closes: '18:00',
    }))
  }

  // Add price range
  if (business.priceRange) {
    structuredData.priceRange = business.priceRange
  }

  return structuredData
}

/**
 * Generate website structured data
 */
export function generateWebsiteStructuredData(
  config: SEOConfig = DEFAULT_SEO_CONFIG
): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: config.siteName,
    url: config.siteUrl,
    description: config.defaultDescription,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${config.siteUrl}/properties?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}
