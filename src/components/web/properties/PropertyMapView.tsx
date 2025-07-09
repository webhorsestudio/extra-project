'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const PropertyMap = dynamic(() => import('@/components/web/PropertyMap'), { ssr: false });

interface PropertyMapViewProps {
  properties: unknown[];
}

// Local Property interface matching what PropertyMap expects
interface Property {
  id: string;
  title: string;
  latitude?: number;
  longitude?: number;
  location_data?: { name?: string };
  [key: string]: unknown;
}

const PropertyMapView: React.FC<PropertyMapViewProps> = ({ properties }) => {
  const safeProperties = Array.isArray(properties) ? properties : [];

  // Transform the properties to match the Property interface expected by PropertyMap
  const transformedProperties: Property[] = safeProperties.map((prop: unknown) => {
    if (prop && typeof prop === 'object') {
      const property = prop as Record<string, unknown>;
      return {
        id: String(property.id || ''),
        title: String(property.title || ''),
        latitude: typeof property.latitude === 'number' ? property.latitude : undefined,
        longitude: typeof property.longitude === 'number' ? property.longitude : undefined,
        location_data: property.location_data as { name?: string } | undefined,
        ...(property as Record<string, unknown>)
      };
    }
    return {
      id: '',
      title: '',
    };
  });

  return (
    <div className="h-[600px] w-full">
      <PropertyMap properties={transformedProperties} />
    </div>
  );
};

export default PropertyMapView; 