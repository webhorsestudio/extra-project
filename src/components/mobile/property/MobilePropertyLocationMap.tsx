'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Property } from '@/types/property';

// Dynamically import react-leaflet components for client-side only rendering
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const ZoomControl = dynamic(() => import('react-leaflet').then(mod => mod.ZoomControl), { ssr: false });

// Dynamically import Leaflet utilities
let Icon: typeof import('leaflet').Icon | null = null;

// Load Leaflet utilities on client side
if (typeof window !== 'undefined') {
  import('leaflet').then((L) => {
    Icon = L.Icon;
  });
}

// Golden SVG pin as data URI (same as web layout)
const goldenPinSVG = encodeURIComponent(`
  <svg width="32" height="48" viewBox="0 0 32 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="16" cy="16" rx="14" ry="14" fill="#FFD700" stroke="#B8860B" stroke-width="3"/>
    <path d="M16 48C16 48 28 32 16 32C4 32 16 48 16 48Z" fill="#FFD700" stroke="#B8860B" stroke-width="3"/>
    <circle cx="16" cy="16" r="6" fill="#fff" stroke="#B8860B" stroke-width="2"/>
  </svg>
`);

// Create custom icon function to handle dynamic loading
const createCustomIcon = () => {
  if (!Icon) return undefined;
  return new Icon({
    iconUrl: `data:image/svg+xml,${goldenPinSVG}`,
    iconSize: [32, 48],
    iconAnchor: [16, 48],
    popupAnchor: [0, -48],
  });
};



interface MobilePropertyLocationMapProps {
  property: Property;
  locationName?: string;
}

const MobilePropertyLocationMap: React.FC<MobilePropertyLocationMapProps> = ({ property, locationName }) => {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);
  const zoom = 15; // Same zoom level as web layout

  // Same geocoding logic as web layout
  useEffect(() => {
    if (property.latitude && property.longitude) {
      setPosition([property.latitude, property.longitude]);
      return;
    }
    if (locationName) {
      setLoading(true);
      // Use Nominatim for geocoding (same as web layout)
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
          } else {
            setPosition([18.9822, 72.8336]); // fallback to Mumbai (same as web layout)
          }
        })
        .catch(() => setPosition([18.9822, 72.8336]))
        .finally(() => setLoading(false));
    } else {
      setPosition([18.9822, 72.8336]); // fallback to Mumbai (same as web layout)
    }
  }, [property.latitude, property.longitude, locationName]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-full mx-1 my-4">
      <div className="bg-white/90 backdrop-blur-md border-gray-200/50 rounded-2xl shadow-sm px-6 pt-6 pb-6">
        {/* Section Header */}
        <div className="text-lg font-bold text-black mb-3">Location</div>
        {/* Leaflet Map */}
        <div className="w-full aspect-square relative rounded-xl overflow-hidden">
          {mounted ? (
            loading || !position ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <span className="text-gray-400">Loading map...</span>
              </div>
            ) : (
              <MapContainer
                key={position ? `${position[0]},${position[1]}` : 'default'}
                center={position}
                zoom={zoom}
                scrollWheelZoom={true}
                style={{ width: '100%', height: '100%', minHeight: 220, borderRadius: 16 }}
                dragging={true}
                zoomControl={false}
                attributionControl={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {createCustomIcon() && (
                  <Marker position={position} icon={createCustomIcon()!}>
                    <Popup>
                      {property.title}
                    </Popup>
                  </Marker>
                )}
                <ZoomControl position="bottomright" />
              </MapContainer>
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-gray-400">Loading map...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobilePropertyLocationMap; 