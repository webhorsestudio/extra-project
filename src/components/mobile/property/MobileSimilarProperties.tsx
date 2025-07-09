'use client';

import React from 'react';
import { Property } from '@/types/property';
import PropertyCard from '@/components/mobile/PropertyCard';

interface MobileSimilarPropertiesProps {
  properties: Property[];
}

function normalizeProperty(property: Property): Property {
  const config = property.property_configurations?.[0];
  return {
    ...property,
    price: property.price ?? config?.price,
    bedrooms: property.bedrooms ?? config?.bedrooms,
    area: property.area ?? config?.area,
    property_images: property.property_images ?? property.images ?? [],
    location: property.location ?? property.location_data?.name,
  };
}

export default function MobileSimilarProperties({ properties }: MobileSimilarPropertiesProps) {
  if (!properties || properties.length === 0) return null;
  return (
    <div className="w-full">
      <div className="text-lg font-bold text-[#0A1736] mb-4 px-4">Similar projects</div>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2 snap-x snap-mandatory" style={{ WebkitOverflowScrolling: 'touch' }}>
        {properties.map(property => {
          const normalized = normalizeProperty(property);
          return (
            <div key={property.id} className="flex-shrink-0 w-96 snap-center first:ml-4 last:mr-4">
              <PropertyCard property={normalized} />
            </div>
          );
        })}
      </div>
    </div>
  );
} 