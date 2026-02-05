'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { generateBreadcrumbStructuredData } from '@/lib/seo/structured-data'
import { getSEOConfigClient } from '@/lib/seo/config-client'
import { useEffect, useState } from 'react'

interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
  showHome?: boolean
  includeStructuredData?: boolean
}

export function Breadcrumbs({ 
  items, 
  className = '', 
  showHome = true,
  includeStructuredData = true 
}: BreadcrumbsProps) {
  const [structuredData, setStructuredData] = useState<string>('')

  useEffect(() => {
    if (includeStructuredData) {
      const generateStructuredData = async () => {
        try {
          const config = await getSEOConfigClient()
          const breadcrumbData = generateBreadcrumbStructuredData(items, config)
          setStructuredData(JSON.stringify(breadcrumbData))
        } catch (error) {
          console.error('Error generating breadcrumb structured data:', error)
        }
      }
      
      generateStructuredData()
    }
  }, [items, includeStructuredData])

  // Add home item if requested and not already present
  const breadcrumbItems = showHome && items[0]?.name !== 'Home' 
    ? [{ name: 'Home', url: '/' }, ...items]
    : items

  return (
    <>
      {/* Structured Data */}
      {includeStructuredData && structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredData }}
        />
      )}

      {/* Breadcrumb Navigation */}
      <nav 
        aria-label="Breadcrumb" 
        className={`flex items-center space-x-1 text-sm text-gray-600 ${className}`}
      >
        <ol className="flex items-center space-x-1">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1
            const isHome = item.name === 'Home'
            
            return (
              <li key={item.url} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
                )}
                
                {isLast ? (
                  <span 
                    className="font-medium text-gray-900"
                    aria-current="page"
                  >
                    {isHome && <Home className="h-4 w-4 inline mr-1" />}
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.url}
                    className="hover:text-gray-900 transition-colors duration-200 flex items-center"
                  >
                    {isHome && <Home className="h-4 w-4 mr-1" />}
                    {item.name}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}

/**
 * Property-specific breadcrumbs
 */
interface PropertyBreadcrumbsProps {
  property: {
    title: string
    location: string
    property_type: string
    id: string
  }
  className?: string
}

export function PropertyBreadcrumbs({ property, className }: PropertyBreadcrumbsProps) {
  const breadcrumbItems: BreadcrumbItem[] = [
    { name: 'Properties', url: '/properties' },
    { name: property.location, url: `/properties/${property.location.toLowerCase().replace(/\s+/g, '-')}` },
    { name: property.property_type, url: `/properties/${property.location.toLowerCase().replace(/\s+/g, '-')}/${property.property_type.toLowerCase()}` },
    { name: property.title, url: `/properties/${property.id}` },
  ]

  return (
    <Breadcrumbs 
      items={breadcrumbItems} 
      className={className}
      showHome={true}
    />
  )
}

/**
 * Blog-specific breadcrumbs
 */
interface BlogBreadcrumbsProps {
  blog: {
    title: string
    category?: string
    slug: string
  }
  className?: string
}

export function BlogBreadcrumbs({ blog, className }: BlogBreadcrumbsProps) {
  const breadcrumbItems: BreadcrumbItem[] = [
    { name: 'Blog', url: '/blog' },
    ...(blog.category ? [{ name: blog.category, url: `/blog/${blog.category.toLowerCase().replace(/\s+/g, '-')}` }] : []),
    { name: blog.title, url: `/blog/${blog.slug}` },
  ]

  return (
    <Breadcrumbs 
      items={breadcrumbItems} 
      className={className}
      showHome={true}
    />
  )
}

/**
 * Public listing-specific breadcrumbs
 */
interface PublicListingBreadcrumbsProps {
  listing: {
    title: string
    type: string
    slug: string
  }
  className?: string
}

export function PublicListingBreadcrumbs({ listing, className }: PublicListingBreadcrumbsProps) {
  const breadcrumbItems: BreadcrumbItem[] = [
    { name: 'Public Listings', url: '/public-listings' },
    { name: listing.type.replace('_', ' '), url: `/public-listings?type=${listing.type}` },
    { name: listing.title, url: `/public-listings/${listing.slug}` },
  ]

  return (
    <Breadcrumbs 
      items={breadcrumbItems} 
      className={className}
      showHome={true}
    />
  )
}
