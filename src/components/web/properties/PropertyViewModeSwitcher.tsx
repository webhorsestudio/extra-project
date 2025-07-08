'use client';

import React from 'react';
import { Grid3X3, Map, SplitSquareVertical } from 'lucide-react';

export type ViewMode = 'grid' | 'split' | 'map';

interface PropertyViewModeSwitcherProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const PropertyViewModeSwitcher: React.FC<PropertyViewModeSwitcherProps> = ({
  currentView,
  onViewChange
}) => {
  const viewModes = [
    {
      id: 'grid' as ViewMode,
      label: 'Grid View',
      icon: Grid3X3,
      description: 'Card layout'
    },
    {
      id: 'split' as ViewMode,
      label: 'Split View',
      icon: SplitSquareVertical,
      description: 'List with map'
    },
    {
      id: 'map' as ViewMode,
      label: 'Map View',
      icon: Map,
      description: 'Full map view'
    }
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md rounded-full border border-white/20 p-2 shadow-lg">
        {viewModes.map((view) => {
          const Icon = view.icon;
          const isActive = currentView === view.id;
          
          return (
            <button
              key={view.id}
              onClick={() => onViewChange(view.id)}
              className={`flex items-center gap-3 px-6 py-3 rounded-full text-base font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-500/90 text-white shadow-md'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-white/60'
              }`}
              title={view.description}
            >
              <Icon className="h-5 w-5" />
              <span className="hidden sm:inline">{view.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PropertyViewModeSwitcher; 