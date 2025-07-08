import Image from 'next/image'
import { getLogoInfo } from '@/lib/branding'

interface ServerLogoProps {
  className?: string
  width?: number
  height?: number
  alt?: string
  priority?: boolean
}

export default async function ServerLogo({ 
  className = "h-11 w-40", 
  width = 160, 
  height = 44, 
  alt,
  priority = false 
}: ServerLogoProps) {
  const logoInfo = await getLogoInfo()

  if (!logoInfo.has_logo || !logoInfo.logo_url) {
    // Fallback logo
    return (
      <div className={`${className} bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white font-bold text-lg`}>
        Property
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <Image
        src={logoInfo.logo_url}
        alt={alt || logoInfo.logo_alt_text}
        width={width}
        height={height}
        style={{ objectFit: 'contain' }}
        unoptimized
        priority={priority}
      />
    </div>
  )
} 