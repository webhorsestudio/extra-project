/**
 * Internal linking utilities for better content discovery and SEO
 */

import { createSupabaseClient } from '@/lib/supabase/client'

/**
 * Related content interface
 */
export interface RelatedContent {
  id: string
  title: string
  url: string
  type: 'property' | 'blog' | 'public_listing'
  relevanceScore: number
  excerpt?: string
  image?: string
  location?: string
  property_type?: string
  property_configurations?: Array<{
    price?: number
    bedrooms?: number
    bathrooms?: number
    area?: number
  }>
}

/**
 * Get related properties based on location, type, and price range
 */
export async function getRelatedProperties(
  currentProperty: {
    id: string
    location: string
    property_type: string
    price?: number
    bedrooms?: number
  },
  limit: number = 6
): Promise<RelatedContent[]> {
  try {
    const supabase = createSupabaseClient()
    
    // Build query for related properties
    let query = supabase
      .from('properties')
      .select(`
        id,
        title,
        location,
        property_type,
        slug,
        property_images(image_url),
        property_configurations(price, bedrooms, bathrooms, area)
      `)
      .eq('status', 'active')
      .neq('id', currentProperty.id)
      .limit(limit * 2) // Get more to filter and score
    
    // Prioritize same location
    if (currentProperty.location) {
      query = query.eq('location', currentProperty.location)
    }
    
    const { data: properties, error } = await query
    
    if (error || !properties) {
      return []
    }
    
    // Score and rank properties
    const scoredProperties = properties.map(property => {
      let score = 0
      
      // Get price and bedrooms from first configuration
      const propertyPrice = property.property_configurations?.[0]?.price
      const propertyBedrooms = property.property_configurations?.[0]?.bedrooms
      
      // Same location gets highest score
      if (property.location === currentProperty.location) {
        score += 10
      }
      
      // Same property type
      if (property.property_type === currentProperty.property_type) {
        score += 8
      }
      
      // Similar BHK
      if (currentProperty.bedrooms && propertyBedrooms === currentProperty.bedrooms) {
        score += 6
      }
      
      // Similar price range (within 20%)
      if (currentProperty.price && propertyPrice) {
        const priceDiff = Math.abs(propertyPrice - currentProperty.price) / currentProperty.price
        if (priceDiff <= 0.2) {
          score += 4
        }
      }
      
      return {
        id: property.id,
        title: property.title,
        url: `/properties/${property.slug || property.id}`,
        type: 'property' as const,
        relevanceScore: score,
        image: property.property_images?.[0]?.image_url,
        location: property.location,
        property_type: property.property_type,
        property_configurations: property.property_configurations,
      }
    })
    
    // Sort by relevance score and return top results
    return scoredProperties
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit)
    
  } catch (error) {
    console.error('Error fetching related properties:', error)
    return []
  }
}

/**
 * Get related blog posts based on categories and keywords
 */
export async function getRelatedBlogPosts(
  currentBlog: {
    id: string
    title: string
    categories?: string[]
  },
  limit: number = 4
): Promise<RelatedContent[]> {
  try {
    const supabase = createSupabaseClient()
    
    // Build query for related blog posts
    const query = supabase
      .from('blogs_with_categories')
      .select(`
        id,
        title,
        excerpt,
        featured_image,
        categories
      `)
      .eq('status', 'published')
      .neq('id', currentBlog.id)
      .limit(limit * 2)
    
    const { data: blogs, error } = await query
    
    if (error || !blogs) {
      return []
    }
    
    // Score and rank blog posts
    const scoredBlogs = blogs.map(blog => {
      let score = 0
      
      // Check for category matches
      if (currentBlog.categories && blog.categories) {
        const commonCategories = currentBlog.categories.filter(cat => 
          blog.categories.includes(cat)
        )
        score += commonCategories.length * 5
      }
      
      // Check for keyword matches in title
      const currentKeywords = currentBlog.title.toLowerCase().split(' ')
      const blogKeywords = blog.title.toLowerCase().split(' ')
      const commonKeywords = currentKeywords.filter(keyword => 
        blogKeywords.includes(keyword) && keyword.length > 3
      )
      score += commonKeywords.length * 2
      
      return {
        id: blog.id,
        title: blog.title,
        url: `/blog/${(blog as { slug?: string }).slug || blog.id}`,
        type: 'blog' as const,
        relevanceScore: score,
        excerpt: blog.excerpt,
        image: blog.featured_image,
      }
    })
    
    // Sort by relevance score and return top results
    return scoredBlogs
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit)
    
  } catch (error) {
    console.error('Error fetching related blog posts:', error)
    return []
  }
}

/**
 * Get related public listings based on type and content
 */
export async function getRelatedPublicListings(
  currentListing: {
    id: string
    type: string
    title: string
  },
  limit: number = 4
): Promise<RelatedContent[]> {
  try {
    const supabase = createSupabaseClient()
    
    // Build query for related public listings
    let query = supabase
      .from('public_listings')
      .select(`
        id,
        title,
        slug,
        type,
        excerpt,
        featured_image_url
      `)
      .eq('status', 'published')
      .neq('id', currentListing.id)
      .or('expire_date.is.null,expire_date.gt.now()')
      .limit(limit * 2)
    
    // Prioritize same type
    if (currentListing.type) {
      query = query.eq('type', currentListing.type)
    }
    
    const { data: listings, error } = await query
    
    if (error || !listings) {
      return []
    }
    
    // Score and rank listings
    const scoredListings = listings.map(listing => {
      let score = 0
      
      // Same type gets highest score
      if (listing.type === currentListing.type) {
        score += 10
      }
      
      // Check for keyword matches in title
      const currentKeywords = currentListing.title.toLowerCase().split(' ')
      const listingKeywords = listing.title.toLowerCase().split(' ')
      const commonKeywords = currentKeywords.filter(keyword => 
        listingKeywords.includes(keyword) && keyword.length > 3
      )
      score += commonKeywords.length * 3
      
      return {
        id: listing.id,
        title: listing.title,
        url: `/public-listings/${listing.slug}`,
        type: 'public_listing' as const,
        relevanceScore: score,
        excerpt: listing.excerpt,
        image: listing.featured_image_url,
      }
    })
    
    // Sort by relevance score and return top results
    return scoredListings
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit)
    
  } catch (error) {
    console.error('Error fetching related public listings:', error)
    return []
  }
}

/**
 * Generate contextual internal links based on content
 */
export function generateContextualLinks(
  content: string,
  availableLinks: Array<{
    keyword: string
    url: string
    title: string
  }>
): Array<{
  keyword: string
  url: string
  title: string
  position: number
}> {
  const links: Array<{
    keyword: string
    url: string
    title: string
    position: number
  }> = []
  
  const contentLower = content.toLowerCase()
  
  availableLinks.forEach(link => {
    const keywordLower = link.keyword.toLowerCase()
    const index = contentLower.indexOf(keywordLower)
    
    if (index !== -1) {
      links.push({
        ...link,
        position: index,
      })
    }
  })
  
  // Sort by position and limit to avoid over-linking
  return links
    .sort((a, b) => a.position - b.position)
    .slice(0, 3) // Limit to 3 contextual links
}

/**
 * Generate breadcrumb navigation
 */
export function generateBreadcrumbs(
  path: string,
  pageTitle: string
): Array<{
  name: string
  url: string
}> {
  const segments = path.split('/').filter(Boolean)
  const breadcrumbs: Array<{ name: string; url: string }> = []
  
  // Add home
  breadcrumbs.push({
    name: 'Home',
    url: '/',
  })
  
  // Build breadcrumbs from path segments
  let currentPath = ''
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    
    // Skip the last segment (current page)
    if (index === segments.length - 1) {
      breadcrumbs.push({
        name: pageTitle,
        url: currentPath,
      })
    } else {
      // Convert segment to readable name
      const name = segment
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
      
      breadcrumbs.push({
        name,
        url: currentPath,
      })
    }
  })
  
  return breadcrumbs
}

/**
 * Generate related content suggestions
 */
export async function generateRelatedContentSuggestions(
  contentType: 'property' | 'blog' | 'public_listing',
  contentId: string,
  limit: number = 6
): Promise<RelatedContent[]> {
  try {
    const supabase = createSupabaseClient()
    
    switch (contentType) {
      case 'property': {
        const { data: property } = await supabase
          .from('properties')
          .select('id, title, location, property_type, price, bedrooms')
          .eq('id', contentId)
          .single()
        
        if (property) {
          return await getRelatedProperties(property, limit)
        }
        break
      }
      
      case 'blog': {
        const { data: blog } = await supabase
          .from('blogs_with_categories')
          .select('id, title, categories')
          .eq('id', contentId)
          .single()
        
        if (blog) {
          return await getRelatedBlogPosts(blog, limit)
        }
        break
      }
      
      case 'public_listing': {
        const { data: listing } = await supabase
          .from('public_listings')
          .select('id, title, type')
          .eq('id', contentId)
          .single()
        
        if (listing) {
          return await getRelatedPublicListings(listing, limit)
        }
        break
      }
    }
    
    return []
  } catch (error) {
    console.error('Error generating related content suggestions:', error)
    return []
  }
}

/**
 * Generate internal link suggestions for content
 */
export function generateInternalLinkSuggestions(
  content: string,
  availableContent: Array<{
    title: string
    url: string
    keywords: string[]
  }>
): Array<{
  keyword: string
  url: string
  title: string
  relevance: number
}> {
  const suggestions: Array<{
    keyword: string
    url: string
    title: string
    relevance: number
  }> = []
  
  const contentWords = content.toLowerCase().split(/\s+/)
  
  availableContent.forEach(item => {
    let relevance = 0
    
    item.keywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase()
      
      // Check for exact matches
      if (contentWords.includes(keywordLower)) {
        relevance += 3
      }
      
      // Check for partial matches
      contentWords.forEach(word => {
        if (word.includes(keywordLower) || keywordLower.includes(word)) {
          relevance += 1
        }
      })
    })
    
    if (relevance > 0) {
      suggestions.push({
        keyword: item.keywords[0], // Use first keyword as anchor
        url: item.url,
        title: item.title,
        relevance,
      })
    }
  })
  
  // Sort by relevance and return top suggestions
  return suggestions
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 5)
}
