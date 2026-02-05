'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'

interface PropertyMapLoaderProps {
  properties: Array<{
    id: string;
    title: string;
    latitude?: number;
    longitude?: number;
    location_data?: { name?: string };
    [key: string]: unknown;
  }>;
}

export default function PropertyMapLoader({ properties }: PropertyMapLoaderProps) {
  const Map = useMemo(() => dynamic(
    () => import('@/components/web/PropertyMap'),
    {
      loading: () => <div className="bg-gray-200 h-96 rounded-lg flex items-center justify-center"><p>Loading map...</p></div>,
      ssr: false
    }
  ), []) // Remove unnecessary dependency

  return <Map properties={properties} />
} 