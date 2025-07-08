'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const PropertyMap = dynamic(() => import('@/components/web/PropertyMap'), { ssr: false });

interface PropertyMapViewProps {
  properties: any[];
}

const PropertyMapView: React.FC<PropertyMapViewProps> = ({ properties }) => {
  const safeProperties = Array.isArray(properties) ? properties : [];

  return (
    <div className="h-[600px] w-full">
      <PropertyMap properties={safeProperties} />
    </div>
  );
};

export default PropertyMapView; 