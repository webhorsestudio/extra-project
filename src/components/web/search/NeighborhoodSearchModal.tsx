'use client'

import { X, Search as SearchIcon, MapPin } from 'lucide-react'
import LocationCard from './LocationCard'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Location } from '@/hooks/useLocations'

interface NeighborhoodSearchModalProps {
  onClose: () => void;
  onLocationSelect?: (locationId: string, locationName: string) => void;
  locations?: Location[];
  loading?: boolean;
  error?: string | null;
}

export default function NeighborhoodSearchModal({ 
  onClose, 
  onLocationSelect,
  locations = [],
  loading = false,
  error = null
}: NeighborhoodSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  // Filter locations based on search term with improved matching
  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (location.description && location.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    // Only add event listener on client side
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [onClose]);

  const handleLocationSelect = (location: Location) => {
    console.log('Location selected:', location)
    if (onLocationSelect) {
      onLocationSelect(location.id, location.name)
    } else {
      // Default behavior: navigate to properties page with location filter
              router.push(`/properties?location=${location.id}&locationName=${encodeURIComponent(location.name)}`)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 my-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 rounded-full p-2 shadow-sm z-10"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
        
        {/* Title */}
        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center pr-12">Select Neighborhood</h2>
        
        {/* Search input */}
        <div className="relative mb-6">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search neighborhoods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 shadow focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition text-gray-700 bg-gray-50"
          />
        </div>

        {/* Content area with max height and scroll */}
        <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">Loading locations...</span>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="text-center py-8">
              <p className="text-red-500 mb-2">Failed to load locations</p>
              <p className="text-sm text-gray-600">{error}</p>
            </div>
          )}

          {/* No results */}
          {!loading && !error && filteredLocations.length === 0 && (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-600">
                {searchTerm ? 'No locations found matching your search' : 'No locations available'}
              </p>
            </div>
          )}

          {/* Locations grid */}
          {!loading && !error && filteredLocations.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              {filteredLocations.map((location) => (
                <LocationCard 
                  key={location.id} 
                  location={location}
                  propertyCount={location.property_count}
                  onClick={() => handleLocationSelect(location)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 