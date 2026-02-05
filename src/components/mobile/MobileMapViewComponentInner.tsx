'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Property } from '@/types/property';
import { Icon, LatLngBounds } from 'leaflet';
import { Plus, Minus } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Custom golden pin icon for mobile
const goldenPinSVG = encodeURIComponent(`
  <svg width="32" height="48" viewBox="0 0 32 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="16" cy="16" rx="14" ry="14" fill="#FFD700" stroke="#B8860B" stroke-width="3"/>
    <path d="M16 48C16 48 28 32 16 32C4 32 16 48 16 48Z" fill="#FFD700" stroke="#B8860B" stroke-width="3"/>
    <circle cx="16" cy="16" r="6" fill="#fff" stroke="#B8860B" stroke-width="2"/>
  </svg>
`);

const customIcon = new Icon({
  iconUrl: `data:image/svg+xml,${goldenPinSVG}`,
  iconSize: [32, 48],
  iconAnchor: [16, 48],
  popupAnchor: [0, -48],
});

// Fit bounds component for auto-zooming
function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  
  useEffect(() => {
    if (positions.length > 1) {
      const bounds = new LatLngBounds(positions);
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (positions.length === 1) {
      map.setView(positions[0], 13);
    }
  }, [positions, map]);
  
  return null;
}

// Custom zoom control component for mobile
function CustomZoomControl() {
  const map = useMap();
  
  const handleZoomIn = () => {
    map.zoomIn();
  };
  
  const handleZoomOut = () => {
    map.zoomOut();
  };
  
  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      <button
        onClick={handleZoomIn}
        className="w-12 h-12 bg-white rounded-lg shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-all duration-150 touch-manipulation"
        aria-label="Zoom in"
      >
        <Plus className="w-5 h-5 text-gray-700" />
      </button>
      <button
        onClick={handleZoomOut}
        className="w-12 h-12 bg-white rounded-lg shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-all duration-150 touch-manipulation"
        aria-label="Zoom out"
      >
        <Minus className="w-5 h-5 text-gray-700" />
      </button>
    </div>
  );
}

interface MobileMapViewComponentInnerProps {
  properties: Property[];
  onMarkerClick?: (property: Property) => void;
}

const MobileMapViewComponentInner: React.FC<MobileMapViewComponentInnerProps> = ({ 
  properties, 
  onMarkerClick
}) => {
  const [mounted, setMounted] = useState(false);

  // Only use properties with valid coordinates
  const validProperties = properties.filter(
    (p) => typeof p.latitude === 'number' && typeof p.longitude === 'number' && p.latitude !== 0 && p.longitude !== 0
  );

  const markerPositions: [number, number][] = validProperties.map(
    (p) => [p.latitude as number, p.longitude as number]
  );

  // Center map on the first property with valid coordinates, or fallback to Mumbai
  const defaultPosition: [number, number] = [19.0760, 72.8777];
  const mapPosition: [number, number] = markerPositions[0] || defaultPosition;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMarkerClick = useCallback((property: Property) => {
    if (onMarkerClick) {
      onMarkerClick(property);
    }
  }, [onMarkerClick]);

  const formatPrice = (price?: number) => {
    if (!price) return 'Price on request';
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`;
    } else {
      return `₹${price.toLocaleString()}`;
    }
  };

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <span className="text-gray-500 text-sm">Loading map...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={mapPosition}
        zoom={13}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
        dragging={true}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <FitBounds positions={markerPositions} />
        
        {validProperties.map(property => {
          const price = property.price || property.property_configurations?.[0]?.price;
          const bhk = property.property_configurations?.[0]?.bhk;
          
          return (
            <Marker
              key={property.id}
              position={[property.latitude as number, property.longitude as number]}
              icon={customIcon}
              eventHandlers={{
                click: () => handleMarkerClick(property),
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <div className="font-semibold text-sm mb-1">{property.title}</div>
                  <div className="text-xs text-gray-600 mb-2">
                    {property.location_data?.name || property.location}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-600 font-medium">
                      {formatPrice(price)}
                    </span>
                    {bhk && (
                      <span className="text-gray-500">
                        {bhk} BHK
                      </span>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        {validProperties.length > 0 && <CustomZoomControl />}
      </MapContainer>
    </div>
  );
};

export default MobileMapViewComponentInner; 