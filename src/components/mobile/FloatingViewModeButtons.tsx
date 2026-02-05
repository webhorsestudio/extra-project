import { MapPin, LayoutGrid } from 'lucide-react';
import React from 'react';

/**
 * FloatingViewModeButtons
 * Modular floating action buttons for switching between Map and Grid view modes.
 * Hides/shows with scroll effect (footerVisible prop).
 */
interface FloatingViewModeButtonsProps {
  viewMode: 'grid' | 'map';
  setViewMode: (mode: 'grid' | 'map') => void;
  footerVisible: boolean;
}

function FloatingButton({ icon: Icon, active, onClick, label }: { icon: React.ComponentType<{ className?: string }>; active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`mb-3 w-14 h-14 flex items-center justify-center rounded-full shadow-lg transition-all border-2
        ${active ? 'bg-[#11182B] border-blue-500' : 'bg-[#11182B] border-transparent'}
        hover:scale-105 active:scale-95 focus:outline-none`}
      style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}
    >
      <Icon className="w-7 h-7 text-white" />
    </button>
  );
}

const FloatingViewModeButtons: React.FC<FloatingViewModeButtonsProps> = ({ viewMode, setViewMode, footerVisible }) => (
  <div
    className={`fixed bottom-24 right-6 flex flex-col items-end z-50 transition-all duration-300 ease-in-out
      ${footerVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-12 pointer-events-none'}`}
  >
    <FloatingButton
      icon={MapPin}
      active={viewMode === 'map'}
      onClick={() => setViewMode('map')}
      label="Map View"
    />
    <FloatingButton
      icon={LayoutGrid}
      active={viewMode === 'grid'}
      onClick={() => setViewMode('grid')}
      label="Grid View"
    />
  </div>
);

export default FloatingViewModeButtons; 