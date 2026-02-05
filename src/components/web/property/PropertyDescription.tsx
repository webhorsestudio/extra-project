import React from 'react';
import { Property } from '@/types/property';

interface PropertyDescriptionProps {
  property: Property;
}

export default function PropertyDescription({ property }: PropertyDescriptionProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 space-y-6 text-gray-800 mb-8">
      <h2 className="text-2xl md:text-3xl font-bold mb-2">Description</h2>
      
      {property.description ? (
        <div className="space-y-4">
          {property.description.split('\n').map((paragraph, index) => (
            <p key={index} className="leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 italic">
          No description available for this property.
        </p>
      )}
      
      {property.rera_number && (
        <div className="pt-2">
          <span className="text-xs text-gray-500">RERA NO: {property.rera_number}</span>
        </div>
      )}
    </div>
  );
} 