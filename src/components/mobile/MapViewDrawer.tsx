'use client';

import React from 'react';
import { Property } from '@/types/property';

interface MapViewDrawerProps {
  properties: Property[];
  selectedPropertyId?: string;
  onPropertySelect?: (property: Property) => void;
  onClose?: () => void;
  isOpen?: boolean;
  onSwitchToGridView?: () => void;
}

const MapViewDrawer: React.FC<MapViewDrawerProps> = ({
  properties,
  isOpen = true,
  onSwitchToGridView,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20"
        aria-hidden="true"
      />
      {/* Drawer */}
      <div
        className="relative bg-white rounded-t-3xl shadow-2xl transition-all duration-300 ease-out h-[18vh] flex flex-col items-center cursor-pointer"
        onClick={onSwitchToGridView}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2 w-full">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>
        {/* Property Count */}
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          <div className="text-lg font-medium text-black text-center">
            {properties.length} Properties
          </div>
          <div className="w-12 h-0.5 bg-black rounded-full mt-2 mx-auto" />
        </div>
      </div>
    </div>
  );
};

export default MapViewDrawer; 