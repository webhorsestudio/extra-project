'use client';

import React from 'react';
import { Property } from '@/types/property';

interface MobilePropertyDescriptionProps {
  property: Property;
}

export default function MobilePropertyDescription({ property }: MobilePropertyDescriptionProps) {
  return (
    <div className="bg-white/90 backdrop-blur-md border-gray-200/50 rounded-2xl shadow-lg p-6 mx-1 mt-1 mb-4">
      {property.description && (
        <p className="text-sm text-gray-800 leading-relaxed">
          {property.description}
        </p>
      )}
      {property.rera_number && (
        <div className="mt-6 text-gray-600">
          <span className="font-semibold">RERA NO:</span> <span className="font-normal">{property.rera_number}</span>
        </div>
      )}
    </div>
  );
} 