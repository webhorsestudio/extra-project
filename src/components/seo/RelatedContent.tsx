'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { OptimizedImage } from './OptimizedImage'
import { RelatedContent as RelatedContentType } from '@/lib/seo/internal-linking'
import { generateRelatedContentSuggestions } from '@/lib/seo/internal-linking'
import { useEffect, useState } from 'react'

interface RelatedContentProps {
  contentType: 'property' | 'blog' | 'public_listing'
  contentId: string
  title?: string
  limit?: number
  className?: string
}

export function RelatedContent({
  contentType,
  contentId,
  title = 'Related Content',
  limit = 6,
  className = '',
}: RelatedContentProps) {
  const [relatedContent, setRelatedContent] = useState<RelatedContentType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRelatedContent = async () => {
      try {
        setLoading(true)
        const content = await generateRelatedContentSuggestions(
          contentType,
          contentId,
          limit
        )
        setRelatedContent(content)
      } catch (error) {
        console.error('Error fetching related content:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRelatedContent()
  }, [contentType, contentId, limit])

  if (loading) {
    return (
      <section className={`py-8 ${className}`}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: limit }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  if (relatedContent.length === 0) {
    return null
  }

  return (
    <section className={`py-8 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedContent.map((item) => (
          <RelatedContentCard key={item.id} content={item} />
        ))}
      </div>
    </section>
  )
}

interface RelatedContentCardProps {
  content: RelatedContentType
}

function RelatedContentCard({ content }: RelatedContentCardProps) {
  const getTypeBadge = (type: string) => {
    const badges = {
      property: { label: 'Property', variant: 'default' as const },
      blog: { label: 'Blog', variant: 'secondary' as const },
      public_listing: { label: 'News', variant: 'outline' as const },
    }
    
    return badges[type as keyof typeof badges] || { label: type, variant: 'outline' as const }
  }

  const badge = getTypeBadge(content.type)

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <Link href={content.url} className="block">
        {content.image && (
          <div className="relative h-48 overflow-hidden rounded-t-lg">
            <OptimizedImage
              src={content.image}
              alt={content.title}
              width={400}
              height={200}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={badge.variant} className="text-xs">
              {badge.label}
            </Badge>
            {content.relevanceScore > 0 && (
              <span className="text-xs text-gray-500">
                {Math.round((content.relevanceScore / 20) * 100)}% match
              </span>
            )}
          </div>
          
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {content.title}
          </h3>
          
          {content.excerpt && (
            <p className="text-sm text-gray-600 line-clamp-3">
              {content.excerpt}
            </p>
          )}
        </CardContent>
      </Link>
    </Card>
  )
}

/**
 * Property-specific related content
 */
interface RelatedPropertiesProps {
  property: {
    id: string
    location: string
    property_type: string
    price?: number
    bedrooms?: number
  }
  title?: string
  limit?: number
  className?: string
}

export function RelatedProperties({
  property,
  title = 'Similar Properties',
  limit = 6,
  className = '',
}: RelatedPropertiesProps) {
  return (
    <RelatedContent
      contentType="property"
      contentId={property.id}
      title={title}
      limit={limit}
      className={className}
    />
  )
}

/**
 * Blog-specific related content
 */
interface RelatedBlogPostsProps {
  blog: {
    id: string
    title: string
    categories?: string[]
  }
  title?: string
  limit?: number
  className?: string
}

export function RelatedBlogPosts({
  blog,
  title = 'Related Articles',
  limit = 4,
  className = '',
}: RelatedBlogPostsProps) {
  return (
    <RelatedContent
      contentType="blog"
      contentId={blog.id}
      title={title}
      limit={limit}
      className={className}
    />
  )
}

/**
 * Public listing-specific related content
 */
interface RelatedPublicListingsProps {
  listing: {
    id: string
    title: string
    type: string
  }
  title?: string
  limit?: number
  className?: string
}

export function RelatedPublicListings({
  listing,
  title = 'Related Updates',
  limit = 4,
  className = '',
}: RelatedPublicListingsProps) {
  return (
    <RelatedContent
      contentType="public_listing"
      contentId={listing.id}
      title={title}
      limit={limit}
      className={className}
    />
  )
}
