"use client"

import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'

interface AdminLogoProps {
  className?: string
  width?: number
  height?: number
  alt?: string
  priority?: boolean
  logoUrl?: string | null
  logoAltText?: string | null
  loading?: boolean
}

export default function AdminLogo({ 
  className = "h-8 w-32", 
  width = 128, 
  height = 32, 
  alt = "Admin Logo",
  priority = false,
  logoUrl,
  logoAltText,
  loading = false
}: AdminLogoProps) {
  if (loading) {
    return <Skeleton className={className} />
  }

  if (logoUrl) {
    return (
      <div className={`relative ${className}`}>
        <Image
          src={logoUrl}
          alt={logoAltText || alt}
          width={width}
          height={height}
          style={{ objectFit: 'contain' }}
          unoptimized
          priority={priority}
        />
      </div>
    )
  }

  // Fallback logo
  return (
    <div className={`${className} bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white font-bold text-lg`}>
      Admin
    </div>
  )
} 