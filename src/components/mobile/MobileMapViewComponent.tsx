'use client';

import React from 'react';
import { Property } from '@/types/property';
import dynamic from 'next/dynamic';

// Dynamically import the map component to prevent SSR issues
const MobileMapViewComponentInner = dynamic(() => import('./MobileMapViewComponentInner'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <span className="text-gray-500 text-sm">Loading map...</span>
      </div>
    </div>
  )
});

interface MobileMapViewComponentProps {
  properties: Property[];
  onMarkerClick?: (property: Property) => void;
}

const MobileMapViewComponent: React.FC<MobileMapViewComponentProps> = ({ 
  properties, 
  onMarkerClick
}) => {
  return (
    <MobileMapViewComponentInner 
      properties={properties} 
      onMarkerClick={onMarkerClick} 
    />
  );
};

export default MobileMapViewComponent; 