'use client';

import React from 'react';
import Image from 'next/image';
import { MapPin, Home } from 'lucide-react';
import { MobileLocationData } from '@/lib/mobile-data';

interface LocationGridProps {
  locations: MobileLocationData[];
  selected: string | null;
  onSelect: (locationId: string) => void;
  loading?: boolean;
  hasMore?: boolean;
}

export default function LocationGrid({ 
  locations, 
  selected, 
  onSelect, 
  loading = false,
  hasMore = false
}: LocationGridProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded-xl"></div>
          </div>
        ))}
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="text-center py-8">
        <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-600">No locations available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {locations.map((location) => (
        <button
          key={location.id}
          onClick={() => onSelect(location.id)}
          className={`w-full flex items-center p-4 rounded-xl border transition-all duration-200 ${
            selected === location.id
              ? 'bg-blue-50 border-blue-200 shadow-md'
              : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
          }`}
        >
          {/* Location Image */}
          <div className="relative w-12 h-12 rounded-lg overflow-hidden mr-4 flex-shrink-0">
            {location.image_url ? (
              <Image
                src={location.image_url}
                alt={location.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-blue-500" />
              </div>
            )}
          </div>

          {/* Location Info */}
          <div className="flex-1 text-left">
            <div className="font-semibold text-gray-900 text-base mb-1">
              {location.name}
            </div>
            {location.description && (
              <div className="text-sm text-gray-500 mb-2 line-clamp-2">
                {location.description}
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Home className="h-3 w-3" />
              <span>
                {location.property_count} {location.property_count === 1 ? 'property' : 'properties'}
              </span>
            </div>
          </div>

          {/* Selection Indicator */}
          {selected === location.id && (
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center ml-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </button>
      ))}
      
      {/* Show message if there are more locations */}
      {hasMore && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">
            Showing top 5 locations. Use search to find more.
          </p>
        </div>
      )}
    </div>
  );
} 