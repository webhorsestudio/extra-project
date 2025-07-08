'use client';

import React, { useState } from 'react';
import PropertyCardV2 from '@/components/web/PropertyCardV2';
import PropertyViewModeSwitcher, { ViewMode } from './PropertyViewModeSwitcher';
import PropertySplitView from './PropertySplitView';
import PropertyMapView from './PropertyMapView';
import type { Property } from '@/types/property';

interface PropertiesGridProps {
  initialProperties: any[];
  initialFilters: {
    location?: string;
    min_price?: number;
    max_price?: number;
    type?: string;
    bhk?: number;
  };
}

const PropertiesGrid: React.FC<PropertiesGridProps> = ({ 
  initialProperties, 
  initialFilters 
}) => {
  const [currentView, setCurrentView] = useState<ViewMode>('grid');

  console.log('PropertiesGrid: Rendering with', {
    propertiesCount: initialProperties.length,
    filters: initialFilters,
    currentView,
    sampleProperty: initialProperties[0] ? {
      id: initialProperties[0].id,
      title: initialProperties[0].title,
      location_data: initialProperties[0].location_data,
      price: initialProperties[0].price
    } : null
  });

  if (!initialProperties || initialProperties.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="text-gray-400 mb-4">No properties found matching your criteria.</div>
        <button 
          onClick={() => window.location.href = '/properties'} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Clear Filters
        </button>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'grid':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {initialProperties.map(property => (
              <PropertyCardV2 
                key={property.id} 
                property={property as Property}
                initialIsFavorited={false}
              />
            ))}
          </div>
        );
      case 'split':
        return <PropertySplitView properties={initialProperties} />;
      case 'map':
        return <PropertyMapView properties={initialProperties} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Property Count */}
      <div className="text-sm text-gray-500">
        {initialProperties.length} properties found
      </div>
      
      {/* Properties Display */}
      {renderView()}
      
      {/* Floating View Mode Switcher */}
      <PropertyViewModeSwitcher 
        currentView={currentView}
        onViewChange={setCurrentView}
      />
    </div>
  );
};

export default PropertiesGrid; 