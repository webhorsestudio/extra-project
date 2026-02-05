"use client"

import React from 'react'
import Image from 'next/image'

interface AvatarCircleProps {
  src?: string | null
  alt?: string
  size?: number
}

export default function AvatarCircle({ src, alt = 'User', size = 32 }: AvatarCircleProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className="flex items-center justify-center rounded-full bg-[#5A6782]"
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          className="w-full h-full object-cover rounded-full"
          width={size}
          height={size}
        />
      ) : (
        // Fallback SVG icon (user silhouette)
        <svg
          width={size * 0.7}
          height={size * 0.7}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="8.5" r="4.5" fill="#D9DFEC" />
          <ellipse cx="12" cy="17" rx="7" ry="4" fill="#D9DFEC" />
        </svg>
      )}
    </div>
  )
} 