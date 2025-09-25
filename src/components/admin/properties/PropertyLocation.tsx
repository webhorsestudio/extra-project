'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useFormContext } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useLocations } from '@/hooks/useLocations'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Dynamically import MapPicker to avoid SSR issues
const MapPicker = dynamic(() => import('./MapPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  )
})

interface PropertyLocationProps {
  initialPosition?: [number, number]
  onPositionChange?: (position: [number, number]) => void
  className?: string
}

// Simple error boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('PropertyLocation error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">Location component error. Please refresh the page.</p>
          </CardContent>
        </Card>
      )
    }
    return this.props.children
  }
}

export default function PropertyLocation({ 
  initialPosition,
  onPositionChange, 
  className = '' 
}: PropertyLocationProps) {
  const form = useFormContext()
  const [currentPosition, setCurrentPosition] = useState<[number, number]>(
    initialPosition || [20.5937, 78.9629]
  )
  const [isGeocoding, setIsGeocoding] = useState(false)

  // New: Fetch locations
  const { locations, loading: locationsLoading } = useLocations()

  // New: Watch location_id
  const locationIdValue = form.watch('location_id')

  // Get location value from form
  const locationValue = form.watch('location')

  // Initialize position from form values or initialPosition prop
  useEffect(() => {
    if (initialPosition) {
      setCurrentPosition(initialPosition)
      // Update form coordinates
      form.setValue('latitude', initialPosition[0])
      form.setValue('longitude', initialPosition[1])
    } else {
      const lat = form.getValues('latitude')
      const lon = form.getValues('longitude')
      if (lat && lon) {
        setCurrentPosition([lat, lon])
      }
    }
  }, [form, initialPosition])

  // Geocoding function to convert address to coordinates
  const geocodeAddress = useCallback(async (address: string) => {
    if (!address.trim()) return

    setIsGeocoding(true)
    try {
      // Using OpenStreetMap Nominatim API for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      )
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const text = await response.text()
      if (!text || text === 'undefined') {
        throw new Error('Empty or invalid response from geocoding service')
      }
      
      const data = JSON.parse(text)

      if (data && Array.isArray(data) && data.length > 0) {
        const { lat, lon } = data[0]
        if (lat && lon) {
          const newPosition: [number, number] = [parseFloat(lat), parseFloat(lon)]
          setCurrentPosition(newPosition)
          onPositionChange?.(newPosition)
          
          // Update form coordinates
          form.setValue('latitude', newPosition[0])
          form.setValue('longitude', newPosition[1])
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      // Don't show error to user, just log it
    } finally {
      setIsGeocoding(false)
    }
  }, [form, onPositionChange])

  // Handle location field changes with debouncing
  useEffect(() => {
    if (!locationValue || locationValue.trim().length < 3) return

    const timeoutId = setTimeout(() => {
      geocodeAddress(locationValue)
    }, 1000) // Wait 1 second after user stops typing

    return () => clearTimeout(timeoutId)
  }, [locationValue, geocodeAddress])

  // Handle map position changes
  const handleMapPositionChange = (position: [number, number]) => {
    setCurrentPosition(position)
    onPositionChange?.(position)
    
    // Reverse geocoding to update the location field
    reverseGeocode(position)
  }

  // Reverse geocoding function to convert coordinates to address
  const reverseGeocode = async (position: [number, number]) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[0]}&lon=${position[1]}&zoom=18&addressdetails=1`
      )
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const text = await response.text()
      if (!text || text === 'undefined') {
        throw new Error('Empty or invalid response from reverse geocoding service')
      }
      
      const data = JSON.parse(text)

      if (data && data.display_name) {
        // Update the location field with the formatted address
        form.setValue('location', data.display_name)
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      // Don't show error to user, just log it
    }
  }

  return (
    <ErrorBoundary>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location & Map
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location Dropdown */}
          <div>
            <Label htmlFor="location_id">Choose Location <span className="text-destructive">*</span></Label>
            {locationsLoading ? (
              <div className="flex items-center gap-2 mt-2"><Loader2 className="h-4 w-4 animate-spin text-gray-400" /> Loading locations...</div>
            ) : locations.length === 0 ? (
              <div className="text-sm text-muted-foreground mt-2">No locations found</div>
            ) : (
              <Select
                value={locationIdValue || ''}
                onValueChange={val => {
                  form.setValue('location_id', val, { shouldValidate: true })
                  
                  // Update location name when location is selected
                  const selectedLocation = locations.find(loc => loc.id === val)
                  if (selectedLocation) {
                    form.setValue('location', selectedLocation.name, { shouldValidate: true })
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      <div className="flex items-center gap-2">
                        {location.image_url && (
                          <Image 
                            src={location.image_url} 
                            alt={location.name}
                            width={24}
                            height={24}
                            className="rounded object-cover"
                          />
                        )}
                        <span>{location.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {form.formState.errors.location_id && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.location_id.message?.toString()}
              </p>
            )}
          </div>

          {/* Location Input */}
          <div>
            <Label htmlFor="location">Location Address</Label>
            <div className="relative">
              <Input
                id="location"
                placeholder="Enter property address..."
                {...form.register('location')}
                className="pr-10"
              />
              {isGeocoding && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Start typing to automatically geocode the address and update the map
            </p>
          </div>

          {/* Map Component */}
          <MapPicker
            position={currentPosition}
            onPositionChange={handleMapPositionChange}
          />
        </CardContent>
      </Card>
    </ErrorBoundary>
  )
} 