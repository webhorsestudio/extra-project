import Image from 'next/image'
import { MapPin, Home } from 'lucide-react'
import { Location } from '@/hooks/useLocations'

interface LocationCardProps {
  location: Location
  onClick?: () => void
  propertyCount?: number
}

export default function LocationCard({ location, onClick, propertyCount }: LocationCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }

  return (
    <div 
      className="cursor-pointer group transition-all duration-200 hover:scale-105"
      onClick={handleClick}
    >
      <div className="relative w-full aspect-square rounded-lg overflow-hidden border group-hover:border-blue-500 transition-colors shadow-sm group-hover:shadow-md">
        {location.image_url ? (
          <Image 
            src={location.image_url} 
            alt={location.name} 
            fill 
            className="object-cover group-hover:scale-110 transition-transform duration-200" 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            <MapPin className="h-8 w-8 text-blue-500" />
          </div>
        )}
        
        {/* Property count badge */}
        {propertyCount !== undefined && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-gray-700 flex items-center gap-1">
            <Home className="h-3 w-3" />
            {propertyCount}
          </div>
        )}
      </div>
      
      <div className="mt-2 text-center">
        <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
          {location.name}
        </p>
        {location.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {location.description}
          </p>
        )}
      </div>
    </div>
  )
} 