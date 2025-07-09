'use client';

import React from 'react';
import PropertyCardV2 from '@/components/web/PropertyCardV2';
import dynamic from 'next/dynamic';
import type { Property } from '@/types/property';

const PropertyMap = dynamic(() => import('@/components/web/PropertyMap'), { ssr: false });

// Type that works with both Property interfaces
type MapProperty = {
  id: string;
  title: string;
  latitude?: number;
  longitude?: number;
  location_data?: { name?: string };
  [key: string]: unknown;
};

interface PropertySplitViewProps {
  properties: Property[];
}

const PropertySplitView: React.FC<PropertySplitViewProps> = ({ properties }) => {
  const safeProperties = Array.isArray(properties) ? properties : [];

  // Transform Property[] to MapProperty[]
  const mapProperties: MapProperty[] = safeProperties.map((property) => ({
    id: String(property.id || ''),
    title: String(property.title || ''),
    latitude: typeof property.latitude === 'number' ? property.latitude : undefined,
    longitude: typeof property.longitude === 'number' ? property.longitude : undefined,
    location_data: property.location_data && property.location_data !== null ? property.location_data as { name?: string } : undefined
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Properties Grid */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Properties</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safeProperties.map(property => (
            <PropertyCardV2 
              key={property.id} 
              property={property}
              initialIsFavorited={false}
            />
          ))}
        </div>
      </div>
      
      {/* Sticky, Tall Map */}
      <div className="h-[600px] sticky top-12 flex items-center justify-center">
        <PropertyMap properties={mapProperties} />
      </div>
    </div>
  );
};

export default PropertySplitView; 