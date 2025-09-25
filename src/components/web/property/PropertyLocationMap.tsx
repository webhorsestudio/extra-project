'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import { Property } from '@/types/property';

// Golden SVG pin as data URI
const goldenPinSVG = encodeURIComponent(`
  <svg width="32" height="48" viewBox="0 0 32 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="16" cy="16" rx="14" ry="14" fill="#FFD700" stroke="#B8860B" stroke-width="3"/>
    <path d="M16 48C16 48 28 32 16 32C4 32 16 48 16 48Z" fill="#FFD700" stroke="#B8860B" stroke-width="3"/>
    <circle cx="16" cy="16" r="6" fill="#fff" stroke="#B8860B" stroke-width="2"/>
  </svg>
`);

// Create icon only on client side
const createCustomIcon = (): L.Icon | null => {
  if (typeof window === 'undefined') return null;
  
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const L = require('leaflet');
  return new L.Icon({
    iconUrl: `data:image/svg+xml,${goldenPinSVG}`,
    iconSize: [32, 48],
    iconAnchor: [16, 48],
    popupAnchor: [0, -48],
  });
};

// Internal Map Component that uses all Leaflet hooks and components
function InternalMapComponent({ 
  position, 
  property, 
  customIcon 
}: { 
  position: [number, number]; 
  property: Property; 
  customIcon: L.Icon | null;
}) {
  const { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } = React.useMemo(() => {
    // Import react-leaflet components dynamically
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } = require('react-leaflet');
    return { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap };
  }, []);

  // RecenterButton component that uses the useMap hook
  function RecenterButton({ position }: { position: [number, number] }) {
    const map = useMap();
    return (
      <button
        className="absolute z-[1000] top-4 right-4 bg-white border border-gray-300 rounded shadow px-3 py-1 text-sm hover:bg-gray-100"
        onClick={() => map.setView(position, map.getZoom())}
        type="button"
      >
        Recenter
      </button>
    );
  }

  return (
    <MapContainer center={position} zoom={15} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }} zoomControl={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position} icon={customIcon}>
        <Popup>
          {property.title}
        </Popup>
      </Marker>
      <ZoomControl position="bottomright" />
      <RecenterButton position={position} />
    </MapContainer>
  );
}

// Dynamically import the internal map component to avoid SSR issues
const DynamicMapComponent = dynamic(() => Promise.resolve(InternalMapComponent), { ssr: false });

interface PropertyLocationMapProps {
  property: Property;
  locationName?: string;
}

export default function PropertyLocationMap({ property, locationName }: PropertyLocationMapProps) {
  const [position, setPosition] = React.useState<[number, number] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);
  const [customIcon, setCustomIcon] = React.useState<L.Icon | null>(null);

  // Initialize client-side state
  React.useEffect(() => {
    setIsClient(true);
    setCustomIcon(createCustomIcon());
  }, []);

  React.useEffect(() => {
    if (property.latitude && property.longitude) {
      setPosition([property.latitude, property.longitude]);
      return;
    }
    if (locationName) {
      setLoading(true);
      // Use Nominatim for geocoding
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
          } else {
            setPosition([18.9822, 72.8336]); // fallback to Mumbai
          }
        })
        .catch(() => setPosition([18.9822, 72.8336]))
        .finally(() => setLoading(false));
    } else {
      setPosition([18.9822, 72.8336]);
    }
  }, [property.latitude, property.longitude, locationName]);

  // Don't render map until client-side hydration is complete
  if (!isClient) {
    return (
      <section className="bg-white rounded-2xl p-6 md:p-8 mb-8 relative">
        <h2 className="text-xl font-semibold mb-6 text-[#0A1736]">Location</h2>
        <div className="w-full h-[350px] md:h-[420px] rounded-2xl overflow-hidden relative">
          <div className="flex items-center justify-center h-full w-full">
            <span className="text-gray-400">Loading map...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl p-6 md:p-8 mb-8 relative">
      <h2 className="text-xl font-semibold mb-6 text-[#0A1736]">Location</h2>
      <div className="w-full h-[350px] md:h-[420px] rounded-2xl overflow-hidden relative">
        {loading || !position ? (
          <div className="flex items-center justify-center h-full w-full">
            <span className="text-gray-400">Loading map...</span>
          </div>
        ) : (
          <DynamicMapComponent 
            position={position} 
            property={property} 
            customIcon={customIcon} 
          />
        )}
      </div>
    </section>
  );
} 