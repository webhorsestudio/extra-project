/**
 * Image SEO utilities for optimization and alt text generation
 */

/**
 * Generate SEO-optimized alt text for property images
 */
export function generatePropertyImageAltText(
  property: {
    title: string
    location: string
    property_type: string
    bedrooms?: number
    bathrooms?: number
  },
  imageType: 'exterior' | 'interior' | 'kitchen' | 'bathroom' | 'bedroom' | 'living' | 'garden' | 'amenity' | 'general' = 'general'
): string {
  const { title, location, property_type, bedrooms, bathrooms } = property
  
  const baseText = `${property_type} in ${location}`
  const roomInfo = bedrooms && bathrooms ? ` - ${bedrooms} BHK with ${bathrooms} bathrooms` : ''
  
  const imageDescriptions = {
    exterior: `Exterior view of ${title}${roomInfo}`,
    interior: `Interior view of ${title}${roomInfo}`,
    kitchen: `Modern kitchen in ${title}${roomInfo}`,
    bathroom: `Bathroom in ${title}${roomInfo}`,
    bedroom: `Bedroom in ${title}${roomInfo}`,
    living: `Living room in ${title}${roomInfo}`,
    garden: `Garden or outdoor space at ${title}${roomInfo}`,
    amenity: `Amenity at ${title}${roomInfo}`,
    general: `${title} - ${baseText}${roomInfo}`,
  }
  
  return imageDescriptions[imageType]
}

/**
 * Generate SEO-optimized alt text for blog images
 */
export function generateBlogImageAltText(
  blog: {
    title: string
    category?: string
  },
  imageType: 'featured' | 'content' = 'featured'
): string {
  const { title, category } = blog
  
  if (imageType === 'featured') {
    return category 
      ? `Featured image for ${title} - ${category} article`
      : `Featured image for ${title}`
  }
  
  return `Image in ${title} article`
}

/**
 * Generate SEO-optimized alt text for public listing images
 */
export function generatePublicListingImageAltText(
  listing: {
    title: string
    type: string
  },
  imageType: 'featured' | 'content' = 'featured'
): string {
  const { title, type } = listing
  
  if (imageType === 'featured') {
    return `Featured image for ${title} - ${type}`
  }
  
  return `Image in ${title} - ${type}`
}

/**
 * Generate alt text for company/organization images
 */
export function generateCompanyImageAltText(
  company: {
    name: string
    type?: string
  },
  imageType: 'logo' | 'office' | 'team' | 'general' = 'general'
): string {
  const { name, type } = company
  
  const imageDescriptions = {
    logo: `${name} logo`,
    office: `${name} office building`,
    team: `${name} team`,
    general: type ? `${name} - ${type}` : name,
  }
  
  return imageDescriptions[imageType]
}

/**
 * Optimize image URL for different sizes and formats
 */
export function optimizeImageUrl(
  imageUrl: string,
  options: {
    width?: number
    height?: number
    quality?: number
    format?: 'webp' | 'jpeg' | 'png' | 'avif'
  } = {}
): string {
  if (!imageUrl) return ''
  
  const { width, height, quality = 80, format = 'webp' } = options
  
  // If it's already an optimized URL or external URL, return as is
  if (imageUrl.includes('?') || imageUrl.startsWith('http')) {
    return imageUrl
  }
  
  // For local images, we can add optimization parameters
  const params = new URLSearchParams()
  
  if (width) params.set('w', width.toString())
  if (height) params.set('h', height.toString())
  if (quality !== 80) params.set('q', quality.toString())
  if (format !== 'webp') params.set('f', format)
  
  const queryString = params.toString()
  return queryString ? `${imageUrl}?${queryString}` : imageUrl
}

/**
 * Generate responsive image srcset
 */
export function generateImageSrcSet(
  baseUrl: string,
  sizes: number[] = [320, 640, 768, 1024, 1280, 1920]
): string {
  return sizes
    .map(size => `${optimizeImageUrl(baseUrl, { width: size })} ${size}w`)
    .join(', ')
}

/**
 * Generate responsive image sizes attribute
 */
export function generateImageSizes(
  breakpoints: Array<{ minWidth: number; size: string }> = [
    { minWidth: 0, size: '100vw' },
    { minWidth: 768, size: '50vw' },
    { minWidth: 1024, size: '33vw' },
  ]
): string {
  return breakpoints
    .map(({ minWidth, size }) => 
      minWidth === 0 ? size : `(min-width: ${minWidth}px) ${size}`
    )
    .join(', ')
}

/**
 * Generate Open Graph image URL
 */
export function generateOGImageUrl(
  imageUrl: string
): string {
  if (!imageUrl) return ''
  
  // For OG images, we typically want 1200x630
  const optimizedUrl = optimizeImageUrl(imageUrl, {
    width: 1200,
    height: 630,
    quality: 90,
    format: 'jpeg'
  })
  
  // If we have title/subtitle, we could overlay text (this would require a service)
  // For now, just return the optimized URL
  return optimizedUrl
}

/**
 * Generate Twitter Card image URL
 */
export function generateTwitterImageUrl(
  imageUrl: string,
  cardType: 'summary' | 'summary_large_image' = 'summary_large_image'
): string {
  if (!imageUrl) return ''
  
  const dimensions = cardType === 'summary_large_image' 
    ? { width: 1200, height: 630 }
    : { width: 400, height: 400 }
  
  return optimizeImageUrl(imageUrl, {
    ...dimensions,
    quality: 90,
    format: 'jpeg'
  })
}

/**
 * Validate image for SEO
 */
export function validateImageSEO(image: {
  url: string
  alt: string
  width?: number
  height?: number
}): {
  isValid: boolean
  issues: string[]
  suggestions: string[]
} {
  const issues: string[] = []
  const suggestions: string[] = []
  
  // Check alt text
  if (!image.alt || image.alt.trim().length === 0) {
    issues.push('Missing alt text')
    suggestions.push('Add descriptive alt text for accessibility and SEO')
  } else if (image.alt.length > 125) {
    issues.push('Alt text is too long')
    suggestions.push('Keep alt text under 125 characters')
  } else if (image.alt.toLowerCase().includes('image of') || image.alt.toLowerCase().includes('picture of')) {
    suggestions.push('Avoid redundant phrases like "image of" in alt text')
  }
  
  // Check image dimensions
  if (image.width && image.height) {
    if (image.width < 300 || image.height < 200) {
      issues.push('Image is too small')
      suggestions.push('Use images at least 300x200 pixels for better quality')
    }
    
    const aspectRatio = image.width / image.height
    if (aspectRatio < 0.5 || aspectRatio > 2) {
      suggestions.push('Consider using images with more standard aspect ratios')
    }
  }
  
  // Check file format
  const extension = image.url.split('.').pop()?.toLowerCase()
  if (extension && !['jpg', 'jpeg', 'png', 'webp', 'avif'].includes(extension)) {
    suggestions.push('Consider using modern image formats like WebP or AVIF')
  }
  
  // Check URL structure
  if (image.url.includes(' ')) {
    issues.push('Image URL contains spaces')
    suggestions.push('Use URL-encoded image URLs without spaces')
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
  }
}

/**
 * Generate image metadata for structured data
 */
export function generateImageStructuredData(
  images: Array<{
    url: string
    alt: string
    width?: number
    height?: number
  }>
): Array<{
  '@type': 'ImageObject'
  url: string
  caption?: string
  width?: number
  height?: number
}> {
  return images.map(image => ({
    '@type': 'ImageObject' as const,
    url: image.url,
    caption: image.alt,
    ...(image.width && { width: image.width }),
    ...(image.height && { height: image.height }),
  }))
}
