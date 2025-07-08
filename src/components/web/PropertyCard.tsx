import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Bed, Bath, Square } from 'lucide-react'
import type { Property } from '@/types/property'

interface PropertyCardProps {
  property: {
    id: string
    title: string
    main_image_url?: string
    location: string
    property_type: string
    property_collection: string
    bhk_configurations?: Array<{
      bhk: number
      price: number
      area: number
      bedrooms: number
      bathrooms: number
    }>
  }
}

export default function PropertyCard({ property }: PropertyCardProps) {
  // Get the first configuration for display
  const firstConfig = property.bhk_configurations?.[0]
  const price = firstConfig?.price
  const area = firstConfig?.area
  const bedrooms = firstConfig?.bedrooms || firstConfig?.bhk
  const bathrooms = firstConfig?.bathrooms

  // Format price
  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)}Cr`
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`
    } else {
      return `₹${price.toLocaleString()}`
    }
  }

  // Format area
  const formatArea = (area: number) => {
    return `${area} sq.ft`
  }

  return (
    <Link href={`/properties/${property.id}`}>
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col group">
        <CardHeader className="p-0">
          <div className="relative h-64 w-full overflow-hidden">
            <Image
              src={property.main_image_url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Property Type Badge */}
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className="bg-white/90 text-gray-800">
                {property.property_type}
              </Badge>
            </div>
            {/* Collection Badge */}
            <div className="absolute top-3 right-3">
              <Badge 
                variant={property.property_collection === 'Featured' ? 'default' : 'secondary'}
                className={property.property_collection === 'Featured' ? 'bg-blue-600' : 'bg-white/90 text-gray-800'}
              >
                {property.property_collection}
              </Badge>
            </div>
            {/* Price Overlay */}
            {price && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="text-white">
                  <div className="text-lg font-bold">{formatPrice(price)}</div>
                  {area && <div className="text-sm opacity-90">{formatArea(area)}</div>}
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 flex-grow">
          <CardTitle className="text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {property.title}
          </CardTitle>
          
          {/* Location */}
          <div className="flex items-center gap-1 text-gray-600 mb-3">
            <MapPin className="h-4 w-4" />
            <span className="text-sm line-clamp-1">{property.location}</span>
          </div>

          {/* Property Details */}
          {(bedrooms || bathrooms || area) && (
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {bedrooms && (
                <div className="flex items-center gap-1">
                  <Bed className="h-4 w-4" />
                  <span>{bedrooms} BHK</span>
                </div>
              )}
              {bathrooms && (
                <div className="flex items-center gap-1">
                  <Bath className="h-4 w-4" />
                  <span>{bathrooms}</span>
                </div>
              )}
              {area && (
                <div className="flex items-center gap-1">
                  <Square className="h-4 w-4" />
                  <span>{formatArea(area)}</span>
                </div>
              )}
            </div>
          )}

          {/* View Details Button */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-blue-600 text-sm font-medium group-hover:text-blue-700 transition-colors">
              View Details →
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
} 