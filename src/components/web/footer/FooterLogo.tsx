'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface FooterLogoProps {
  logoUrl?: string | null
  logoAlt?: string
  logoWidth?: number
  logoHeight?: number
  linkToHome?: boolean
  companyName?: string
}

export default function FooterLogo({ 
  logoUrl: propLogoUrl,
  logoAlt = 'Footer Logo',
  logoWidth = 180,
  logoHeight = 56,
  linkToHome = true,
  companyName = 'Extra Realty'
}: FooterLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(propLogoUrl || null)

  useEffect(() => {
    // If prop logoUrl is provided, use it
    if (propLogoUrl) {
      setLogoUrl(propLogoUrl)
      return
    }

    // Otherwise, fetch from API as fallback
    async function fetchLogo() {
      try {
        const res = await fetch('/api/branding/logo')
        if (res.ok) {
          // If the response is SVG, use a blob URL
          const contentType = res.headers.get('content-type')
          if (contentType && contentType.includes('svg')) {
            const svg = await res.text()
            const blob = new Blob([svg], { type: 'image/svg+xml' })
            setLogoUrl(URL.createObjectURL(blob))
          } else {
            // Otherwise, assume it's an image
            const blob = await res.blob()
            setLogoUrl(URL.createObjectURL(blob))
          }
        }
      } catch (e) {
        setLogoUrl(null)
      }
    }
    
    if (!propLogoUrl) {
      fetchLogo()
    }
    
    // Cleanup blob URL on unmount
    return () => {
      if (logoUrl && logoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(logoUrl)
      }
    }
  }, [propLogoUrl])

  const LogoContent = () => (
    <div className="flex flex-col items-start justify-center mb-4 md:mb-0">
      {logoUrl ? (
        <Image 
          src={logoUrl} 
          alt={logoAlt} 
          width={logoWidth} 
          height={logoHeight} 
          className="mb-2" 
          unoptimized 
        />
      ) : (
        <div 
          className="bg-gray-200 rounded mb-2 flex items-center justify-center text-gray-600 font-semibold text-lg"
          style={{ width: logoWidth, height: logoHeight }}
        >
          {companyName}
        </div>
      )}
    </div>
  )

  if (linkToHome) {
    return (
      <Link href="/" className="hover:opacity-80 transition-opacity">
        <LogoContent />
      </Link>
    )
  }

  return <LogoContent />
} 