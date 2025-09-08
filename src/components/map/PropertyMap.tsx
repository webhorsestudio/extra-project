'use client'

import { useEffect, useRef, useState } from 'react'

interface PropertyMapProps {
  markerPosition: [number, number] | null
  onMapClick: (lat: number, lng: number) => void
}

interface MapClickEvent {
  latlng: {
    lat: number
    lng: number
  }
}

export default function PropertyMap({ markerPosition, onMapClick }: PropertyMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Mumbai coordinates
    const defaultPosition: [number, number] = [19.0760, 72.8777]
    setIsClient(true)
    
    // Dynamically import Leaflet
    import('leaflet').then((L) => {
      // Fix for default marker icon
      const icon = L.icon({
        iconUrl: '/images/marker-icon.png',
        iconRetinaUrl: '/images/marker-icon-2x.png',
        shadowUrl: '/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })

      L.Marker.prototype.options.icon = icon

      if (!mapRef.current) {
        // Initialize map with Mumbai as default location
        mapRef.current = L.map('map', {
          center: markerPosition || defaultPosition,
          zoom: 13,
          zoomControl: true,
          attributionControl: true,
        })

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
        }).addTo(mapRef.current)

        // Add click handler
        mapRef.current.on('click', (e: MapClickEvent) => {
          onMapClick(e.latlng.lat, e.latlng.lng)
        })
      }

      // Update marker position
      if (markerPosition) {
        if (markerRef.current) {
          markerRef.current.setLatLng(markerPosition)
        } else {
          markerRef.current = L.marker(markerPosition).addTo(mapRef.current!)
        }
        mapRef.current.setView(markerPosition, 13)
      }
    }).catch((error) => {
      // If Leaflet fails to load, show a placeholder
      console.warn('Leaflet failed to load, showing placeholder map:', error)
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [markerPosition, onMapClick])

  // Show loading state during SSR
  if (!isClient) {
    return (
      <div className="w-full h-full rounded-lg border bg-muted animate-pulse flex items-center justify-center">
        <div className="text-muted-foreground">Loading map...</div>
      </div>
    )
  }

  return <div id="map" className="w-full h-full rounded-lg border" />
} 