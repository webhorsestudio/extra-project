'use client'

import { Info } from 'lucide-react'
import type { Property } from '@/types/property'
import PropertyCarousel from './PropertyCarousel'

interface LatestPropertiesProps {
  properties: Property[]
}

export default function LatestProperties({ properties }: LatestPropertiesProps) {
  if (!properties || properties.length === 0) {
    return (
      <section className="py-4 sm:py-6 lg:py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">Latest Properties</h2>
            <p className="text-gray-500 mt-2">Discover our newest properties</p>
          </div>
          <div className="flex items-center justify-center text-sm text-gray-500">
            <Info className="h-4 w-4 mr-2" />
            No properties available
          </div>
        </div>
      </section>
    )
  }

  return <PropertyCarousel properties={properties} titleAlign="none" />;
} 