'use client'

import Image from 'next/image'
import { useState } from 'react'
import { optimizeImageUrl, generateImageSizes } from '@/lib/seo/image-seo'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  sizes?: string
  fill?: boolean
  style?: React.CSSProperties
  onClick?: () => void
  onLoad?: () => void
  onError?: () => void
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 80,
  sizes,
  fill = false,
  style,
  onClick,
  onLoad,
  onError,
  placeholder = 'empty',
  blurDataURL,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Optimize the image URL
  const optimizedSrc = optimizeImageUrl(src, {
    width: width || 800,
    height: height || 600,
    quality,
    format: 'webp'
  })

  // Generate srcset for responsive images
  // const _srcSet = generateImageSrcSet(src)

  // Generate sizes attribute
  const imageSizes = sizes || generateImageSizes()

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
    onError?.()
  }

  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height, ...style }}
      >
        <span className="text-gray-500 text-sm">Image failed to load</span>
      </div>
    )
  }

  const imageProps = {
    src: optimizedSrc,
    alt,
    className: `${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`,
    priority,
    quality,
    sizes: imageSizes,
    onLoad: handleLoad,
    onError: handleError,
    onClick,
    style,
    placeholder,
    blurDataURL,
  }

  if (fill) {
    return (
      <Image
        {...imageProps}
        fill
        alt={alt || ''}
        style={{ objectFit: 'cover', ...style }}
      />
    )
  }

  return (
    <Image
      {...imageProps}
      alt={alt || ''}
      width={width || 800}
      height={height || 600}
    />
  )
}

/**
 * Property image component with automatic SEO optimization
 */
interface PropertyImageProps {
  property: {
    title: string
    location: string
    property_type: string
    bedrooms?: number
    bathrooms?: number
  }
  imageUrl: string
  imageType?: 'exterior' | 'interior' | 'kitchen' | 'bathroom' | 'bedroom' | 'living' | 'garden' | 'amenity' | 'general'
  width?: number
  height?: number
  className?: string
  priority?: boolean
  onClick?: () => void
}

export function PropertyImage({
  property,
  imageUrl,
  imageType = 'general',
  width = 800,
  height = 600,
  className = '',
  priority = false,
  onClick,
}: PropertyImageProps) {
  // Generate SEO-optimized alt text
  const altText = generatePropertyImageAltText(property, imageType)

  return (
    <OptimizedImage
      src={imageUrl}
      alt={altText}
      width={width}
      height={height}
      className={className}
      priority={priority}
      onClick={onClick}
      quality={90}
    />
  )
}

/**
 * Blog image component with automatic SEO optimization
 */
interface BlogImageProps {
  blog: {
    title: string
    category?: string
  }
  imageUrl: string
  imageType?: 'featured' | 'content'
  width?: number
  height?: number
  className?: string
  priority?: boolean
  onClick?: () => void
}

export function BlogImage({
  blog,
  imageUrl,
  imageType = 'featured',
  width = 800,
  height = 600,
  className = '',
  priority = false,
  onClick,
}: BlogImageProps) {
  // Generate SEO-optimized alt text
  const altText = generateBlogImageAltText(blog, imageType)

  return (
    <OptimizedImage
      src={imageUrl}
      alt={altText}
      width={width}
      height={height}
      className={className}
      priority={priority}
      onClick={onClick}
      quality={90}
    />
  )
}

/**
 * Public listing image component with automatic SEO optimization
 */
interface PublicListingImageProps {
  listing: {
    title: string
    type: string
  }
  imageUrl: string
  imageType?: 'featured' | 'content'
  width?: number
  height?: number
  className?: string
  priority?: boolean
  onClick?: () => void
}

export function PublicListingImage({
  listing,
  imageUrl,
  imageType = 'featured',
  width = 800,
  height = 600,
  className = '',
  priority = false,
  onClick,
}: PublicListingImageProps) {
  // Generate SEO-optimized alt text
  const altText = generatePublicListingImageAltText(listing, imageType)

  return (
    <OptimizedImage
      src={imageUrl}
      alt={altText}
      width={width}
      height={height}
      className={className}
      priority={priority}
      onClick={onClick}
      quality={90}
    />
  )
}

// Import the alt text generation functions
import {
  generatePropertyImageAltText,
  generateBlogImageAltText,
  generatePublicListingImageAltText,
} from '@/lib/seo/image-seo'
