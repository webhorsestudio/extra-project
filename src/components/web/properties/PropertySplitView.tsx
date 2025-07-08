'use client';

import React from 'react';
import PropertyCardV2 from '@/components/web/PropertyCardV2';
import dynamic from 'next/dynamic';
import type { Property } from '@/types/property';

const PropertyMap = dynamic(() => import('@/components/web/PropertyMap'), { ssr: false });

interface PropertySplitViewProps {
  properties: any[];
}

const PropertySplitView: React.FC<PropertySplitViewProps> = ({ properties }) => {
  const safeProperties = Array.isArray(properties) ? properties : [];
  // Use the first property with valid lat/lng as the map center, or fallback to Mumbai
  const defaultPosition: [number, number] = [19.0760, 72.8777];
  const firstWithCoords = safeProperties.find((p) => p.latitude && p.longitude);
  const mapPosition: [number, number] = firstWithCoords
    ? [firstWithCoords.latitude, firstWithCoords.longitude]
    : defaultPosition;
  const mapPopup = firstWithCoords?.title || 'Property Location';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Properties Grid */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Properties</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safeProperties.map(property => (
            <PropertyCardV2 
              key={property.id} 
              property={property as Property}
              initialIsFavorited={false}
            />
          ))}
        </div>
      </div>
      
      {/* Sticky, Tall Map */}
      <div className="h-[600px] sticky top-12 flex items-center justify-center">
        <PropertyMap properties={safeProperties} />
      </div>
    </div>
  );
};

export default PropertySplitView; 