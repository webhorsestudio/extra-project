'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, Navigation, Crosshair } from 'lucide-react'

// Fix for default marker icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/marker-icon-2x.png',
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
})

interface MapPickerProps {
  position?: [number, number]
  onPositionChange?: (position: [number, number]) => void
  className?: string
}

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map]);
  return null
}

export default function MapPicker({ 
  position: initialPosition = [20.5937, 78.9629],
  onPositionChange,
  className = ''
}: MapPickerProps) {
  const [currentPosition, setCurrentPosition] = useState<[number, number]>(initialPosition)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const markerRef = useRef<L.Marker>(null)

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
      (err) => {
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

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Map Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <MapContainer center={currentPosition} zoom={13} style={{ height: '400px', width: '100%' }} className="rounded-lg">
          <ChangeView center={currentPosition} zoom={13} />
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

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              type="number"
              step="any"
              value={currentPosition[0]}
              onChange={handleLatitudeChange}
              placeholder="Latitude"
            />
          </div>
          <div>
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              value={currentPosition[1]}
              onChange={handleLongitudeChange}
              placeholder="Longitude"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={getCurrentLocation}
            disabled={isLoading}
            className="flex-1"
          >
            <Crosshair className="h-4 w-4 mr-2" />
            {isLoading ? 'Getting Location...' : 'Use Current Location'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const resetPosition: [number, number] = [20.5937, 78.9629]
              setCurrentPosition(resetPosition)
              onPositionChange?.(resetPosition)
            }}
            className="flex-1"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Reset to India
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 