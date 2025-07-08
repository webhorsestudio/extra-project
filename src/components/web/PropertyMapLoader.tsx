'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'

interface PropertyMapLoaderProps {
  position: [number, number]
  popupText: string
}

export default function PropertyMapLoader({ position, popupText }: PropertyMapLoaderProps) {
  const Map = useMemo(() => dynamic(
    () => import('@/components/web/PropertyMap'),
    {
      loading: () => <div className="bg-gray-200 h-96 rounded-lg flex items-center justify-center"><p>Loading map...</p></div>,
      ssr: false
    }
  ), [position]) // Re-render if position changes

  return <Map position={position} popupText={popupText} />
} 