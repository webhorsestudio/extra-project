import { useState, useEffect } from 'react'

export interface Location {
  id: string
  name: string
  description: string | null
  image_url: string | null
  image_storage_path: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  property_count?: number
}

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/locations')
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        
        const data = await res.json()
        if (data.error) {
          throw new Error(data.error)
        }
        
        // The API now returns locations with property counts included
        setLocations(data.locations || [])
      } catch (err) {
        console.error('Error fetching locations:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch locations')
      } finally {
        setLoading(false)
      }
    }
    fetchLocations()
  }, [])

  // Only active locations
  const activeLocations = locations.filter(loc => loc.is_active)

  return { locations: activeLocations, loading, error }
} 