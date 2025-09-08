/**
 * URL optimization utilities for SEO-friendly URLs
 */

/**
 * Generate SEO-friendly slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Generate SEO-friendly property URL
 */
export function generatePropertyUrl(
  property: {
    id: string
    title: string
    location: string
    property_type: string
  }
): string {
  const locationSlug = generateSlug(property.location)
  const typeSlug = generateSlug(property.property_type)
  const titleSlug = generateSlug(property.title)
  
  // Create hierarchical URL: /properties/[location]/[type]/[title]-[id]
  return `/properties/${locationSlug}/${typeSlug}/${titleSlug}-${property.id}`
}

/**
 * Generate SEO-friendly public listing URL
 */
export function generatePublicListingUrl(
  listing: {
    slug: string
    type: string
  }
): string {
  const typeSlug = generateSlug(listing.type)
  
  // Create hierarchical URL: /[type]/[slug]
  return `/${typeSlug}/${listing.slug}`
}

/**
 * Generate SEO-friendly blog URL
 */
export function generateBlogUrl(
  blog: {
    slug: string
    category?: string
  }
): string {
  if (blog.category) {
    const categorySlug = generateSlug(blog.category)
    return `/blog/${categorySlug}/${blog.slug}`
  }
  
  return `/blog/${blog.slug}`
}

/**
 * Generate location-based property listing URL
 */
export function generateLocationPropertyUrl(location: string): string {
  const locationSlug = generateSlug(location)
  return `/properties/${locationSlug}`
}

/**
 * Generate property type-based listing URL
 */
export function generatePropertyTypeUrl(
  location: string,
  propertyType: string
): string {
  const locationSlug = generateSlug(location)
  const typeSlug = generateSlug(propertyType)
  return `/properties/${locationSlug}/${typeSlug}`
}

/**
 * Generate BHK-based property listing URL
 */
export function generateBHKPropertyUrl(
  location: string,
  propertyType: string,
  bhk: number
): string {
  const locationSlug = generateSlug(location)
  const typeSlug = generateSlug(propertyType)
  return `/properties/${locationSlug}/${typeSlug}/${bhk}-bhk`
}

/**
 * Extract location from URL path
 */
export function extractLocationFromUrl(path: string): string | null {
  const segments = path.split('/').filter(Boolean)
  
  // Check if it's a property URL: /properties/[location]/...
  if (segments[0] === 'properties' && segments[1]) {
    return segments[1].replace(/-/g, ' ')
  }
  
  return null
}

/**
 * Extract property type from URL path
 */
export function extractPropertyTypeFromUrl(path: string): string | null {
  const segments = path.split('/').filter(Boolean)
  
  // Check if it's a property URL: /properties/[location]/[type]/...
  if (segments[0] === 'properties' && segments[2]) {
    return segments[2].replace(/-/g, ' ')
  }
  
  return null
}

/**
 * Generate canonical URL with proper structure
 */
export function generateCanonicalUrl(
  path: string,
  baseUrl: string = process.env.NEXT_PUBLIC_SITE_URL || 'https://extrarealty.com'
): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${cleanPath}`
}

/**
 * Generate alternate URLs for different languages/regions
 */
export function generateAlternateUrls(
  path: string,
  baseUrl: string = process.env.NEXT_PUBLIC_SITE_URL || 'https://extrarealty.com'
): Array<{ hreflang: string; href: string }> {
  const canonicalUrl = generateCanonicalUrl(path, baseUrl)
  
  return [
    { hreflang: 'en', href: canonicalUrl },
    { hreflang: 'en-IN', href: canonicalUrl },
    { hreflang: 'x-default', href: canonicalUrl },
  ]
}

/**
 * Validate URL structure for SEO
 */
export function validateUrlStructure(url: string): {
  isValid: boolean
  issues: string[]
  suggestions: string[]
} {
  const issues: string[] = []
  const suggestions: string[] = []
  
  // Check URL length
  if (url.length > 100) {
    issues.push('URL is too long (over 100 characters)')
    suggestions.push('Consider shortening the URL by removing unnecessary words')
  }
  
  // Check for special characters
  if (/[^a-zA-Z0-9\-_\/]/.test(url)) {
    issues.push('URL contains special characters')
    suggestions.push('Use only letters, numbers, hyphens, and forward slashes')
  }
  
  // Check for multiple consecutive hyphens
  if (/--+/.test(url)) {
    issues.push('URL contains multiple consecutive hyphens')
    suggestions.push('Replace multiple hyphens with single hyphens')
  }
  
  // Check for trailing slash consistency
  if (url.endsWith('/') && url.length > 1) {
    suggestions.push('Consider removing trailing slash for consistency')
  }
  
  // Check for uppercase letters
  if (/[A-Z]/.test(url)) {
    issues.push('URL contains uppercase letters')
    suggestions.push('Use only lowercase letters in URLs')
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
  }
}

/**
 * Generate URL-friendly text
 */
export function urlFriendlyText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Generate property search URL with filters
 */
export function generatePropertySearchUrl(filters: {
  location?: string
  propertyType?: string
  bhk?: number
  minPrice?: number
  maxPrice?: number
  search?: string
}): string {
  const params = new URLSearchParams()
  
  if (filters.location) {
    params.set('location', filters.location)
  }
  
  if (filters.propertyType) {
    params.set('type', filters.propertyType)
  }
  
  if (filters.bhk) {
    params.set('bhk', filters.bhk.toString())
  }
  
  if (filters.minPrice) {
    params.set('min_price', filters.minPrice.toString())
  }
  
  if (filters.maxPrice) {
    params.set('max_price', filters.maxPrice.toString())
  }
  
  if (filters.search) {
    params.set('search', filters.search)
  }
  
  const queryString = params.toString()
  return queryString ? `/properties?${queryString}` : '/properties'
}
