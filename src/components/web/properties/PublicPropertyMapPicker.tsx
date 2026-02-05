'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Crosshair, Navigation } from 'lucide-react'

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css'

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })

// Import Leaflet for types and useMap hook
import type L from 'leaflet'
import { useMap, useMapEvents } from 'react-leaflet'

// Fix for default marker icon issue with webpack
let icon: L.Icon | null = null

// Initialize icon on client side
if (typeof window !== 'undefined') {
  import('leaflet').then((L) => {
    icon = L.icon({
      iconUrl: '/images/marker-icon.png',
      iconRetinaUrl: '/images/marker-icon-2x.png',
      shadowUrl: '/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    })
    L.Marker.prototype.options.icon = icon
  })
}

interface PublicPropertyMapPickerProps {
  position?: [number, number]
  onPositionChange?: (position: [number, number]) => void
  className?: string
}

// ChangeView component to update map view when position changes
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

// MapClickHandler component to handle map clicks
function MapClickHandler({ onMapClick }: { onMapClick: (latlng: L.LatLng) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng)
    },
  })
  return null
}

export default function PublicPropertyMapPicker({ 
  position: initialPosition = [20.5937, 78.9629],
  onPositionChange,
  className = ''
}: PublicPropertyMapPickerProps) {
  const [currentPosition, setCurrentPosition] = useState<[number, number]>(initialPosition)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const markerRef = useRef<L.Marker | null>(null)

  // Initialize client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (initialPosition && (initialPosition[0] !== currentPosition[0] || initialPosition[1] !== currentPosition[1])) {
      setCurrentPosition(initialPosition)
    }
  }, [initialPosition, currentPosition])

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current
        if (marker != null) {
          const newPos = marker.getLatLng()
          const newPosition: [number, number] = [newPos.lat, newPos.lng]
          setCurrentPosition(newPosition)
          onPositionChange?.(newPosition)
        }
      },
    }),
    [onPositionChange],
  )

  // Handle map click to move marker
  const handleMapClick = (latlng: L.LatLng) => {
    const newPosition: [number, number] = [latlng.lat, latlng.lng]
    setCurrentPosition(newPosition)
    onPositionChange?.(newPosition)
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      return
    }
    setIsLoading(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPosition: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        setCurrentPosition(newPosition)
        onPositionChange?.(newPosition)
        setIsLoading(false)
      },
      () => {
        setError('Unable to get current location')
        setIsLoading(false)
      },
    )
  }

  const handleLatitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lat = parseFloat(e.target.value)
    if (!isNaN(lat)) {
      const newPosition: [number, number] = [lat, currentPosition[1]]
      setCurrentPosition(newPosition)
      onPositionChange?.(newPosition)
    }
  }

  const handleLongitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lon = parseFloat(e.target.value)
    if (!isNaN(lon)) {
      const newPosition: [number, number] = [currentPosition[0], lon]
      setCurrentPosition(newPosition)
      onPositionChange?.(newPosition)
    }
  }

  const resetToIndia = () => {
    const resetPosition: [number, number] = [20.5937, 78.9629]
    setCurrentPosition(resetPosition)
    onPositionChange?.(resetPosition)
  }

  if (!isClient) {
    return (
      <div className={`h-64 w-full bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Map Container */}
      <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-300">
        <MapContainer 
          center={currentPosition} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }} 
          className="rounded-lg"
        >
          <ChangeView center={currentPosition} zoom={13} />
          <MapClickHandler onMapClick={handleMapClick} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={currentPosition}
            ref={markerRef}
          />
        </MapContainer>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {/* Coordinate Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
          <input
            type="number"
            step="any"
            value={currentPosition[0]}
            onChange={handleLatitudeChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Latitude"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
          <input
            type="number"
            step="any"
            value={currentPosition[1]}
            onChange={handleLongitudeChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Longitude"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={isLoading}
          className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Crosshair className="h-4 w-4" />
          {isLoading ? 'Getting Location...' : 'Use Current Location'}
        </button>
        <button
          type="button"
          onClick={resetToIndia}
          className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center gap-2"
        >
          <Navigation className="h-4 w-4" />
          Reset to India
        </button>
      </div>
    </div>
  )
} 