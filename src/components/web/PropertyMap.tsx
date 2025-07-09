'use client'

import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Icon, LatLngBounds } from 'leaflet'
import { useEffect } from 'react'

interface Property {
  id: string;
  title: string;
  latitude?: number;
  longitude?: number;
  location_data?: { name?: string };
  [key: string]: unknown;
}

interface PropertyMapProps {
  properties?: Property[];
}

const customIcon = new Icon({
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

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

export default function PropertyMap({ properties = [] }: PropertyMapProps) {
  // Only use properties with valid coordinates
  const validProperties = properties.filter(
    (p) => typeof p.latitude === 'number' && typeof p.longitude === 'number'
  );
  const markerPositions: [number, number][] = validProperties.map(
    (p) => [p.latitude as number, p.longitude as number]
  );
  // Center map on the first property with valid coordinates, or fallback to Mumbai
  const defaultPosition: [number, number] = [19.0760, 72.8777];
  const mapPosition: [number, number] = markerPositions[0] || defaultPosition;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full h-full">
      <MapContainer center={mapPosition} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds positions={markerPositions} />
        {validProperties.map(property => (
          <Marker
            key={property.id}
            position={[property.latitude as number, property.longitude as number]}
            icon={customIcon}
          >
            <Popup>
              <div className="font-semibold">{property.title}</div>
              {property.location_data?.name && (
                <div className="text-xs text-gray-500 mt-1">{property.location_data.name}</div>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
} 