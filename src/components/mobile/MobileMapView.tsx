'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Property } from '@/types/property';

// Dynamically import the entire map component to avoid SSR issues
const MobileMapViewComponent = dynamic(() => import('./MobileMapViewComponent'), { 
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

interface MobileMapViewProps {
  properties: Property[];
  onMarkerClick?: (property: Property) => void;
}

const MobileMapView: React.FC<MobileMapViewProps> = ({ 
  properties, 
  onMarkerClick
}) => {
  return (
    <MobileMapViewComponent
      properties={properties}
      onMarkerClick={onMarkerClick}
    />
  );
};

export default MobileMapView; 