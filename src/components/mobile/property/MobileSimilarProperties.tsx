'use client';

import React, { useRef, useState } from 'react';
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
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!properties || properties.length === 0) return null;

  // Handle scroll to update active dot
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const cardWidth = scrollRef.current.firstChild instanceof HTMLElement ? scrollRef.current.firstChild.offsetWidth : 1;
    const idx = Math.round(scrollLeft / (cardWidth + 16)); // 16px gap
    setActiveIdx(idx);
  };

  return (
    <div className="w-full">
      <div className="text-lg font-bold text-[#0A1736] mb-4 px-4">Similar projects</div>
      <div
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-2 pb-2 snap-x snap-mandatory"
        style={{ WebkitOverflowScrolling: 'touch' }}
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {properties.map((property) => {
          const normalized = normalizeProperty(property);
          return (
            <div
              key={property.id}
              className="flex-shrink-0 w-[75vw] max-w-xs sm:w-[45vw] snap-center"
            >
              <PropertyCard property={normalized} />
            </div>
          );
        })}
      </div>
      {/* Carousel Dots */}
      <div className="flex items-center justify-center gap-2 mt-3">
        {properties.map((_, idx) => (
          <span
            key={idx}
            className={`w-2 h-2 rounded-full ${activeIdx === idx ? 'bg-[#0A1736]' : 'bg-gray-300'}`}
          />
        ))}
      </div>
    </div>
  );
} 