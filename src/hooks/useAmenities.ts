import { useState, useEffect } from 'react'
import { Amenity, CreateAmenityData, UpdateAmenityData } from '@/types/amenity'

export function useAmenities() {
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAmenities = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/amenities')
      if (res.ok) {
        const data = await res.json()
        setAmenities(data.amenities || [])
      } else {
        const errorData = await res.json()
        setError(errorData.error || 'Failed to fetch amenities')
      }
    } catch {
      setError('Failed to fetch amenities')
    } finally {
      setLoading(false)
    }
  }

  const createAmenity = async (amenityData: CreateAmenityData): Promise<Amenity | null> => {
    try {
      const res = await fetch('/api/amenities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(amenityData)
      })

      if (res.ok) {
        const data = await res.json()
        setAmenities(prev => [data.amenity, ...prev])
        return data.amenity
      } else {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to create amenity')
      }
    } catch (err) {
      throw err
    }
  }

  const updateAmenity = async (id: string, amenityData: UpdateAmenityData): Promise<Amenity | null> => {
    try {
      const res = await fetch(`/api/amenities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(amenityData)
      })

      if (res.ok) {
        const data = await res.json()
        setAmenities(prev => prev.map(amenity => 
          amenity.id === id ? data.amenity : amenity
        ))
        return data.amenity
      } else {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to update amenity')
      }
    } catch (err) {
      throw err
    }
  }

  const deleteAmenity = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/amenities/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setAmenities(prev => prev.filter(amenity => amenity.id !== id))
        return true
      } else {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to delete amenity')
      }
    } catch (err) {
      throw err
    }
  }

  const toggleAmenityStatus = async (amenity: Amenity): Promise<boolean> => {
    try {
      const updatedAmenity = await updateAmenity(amenity.id, {
        name: amenity.name,
        image_url: amenity.image_url,
        image_storage_path: amenity.image_storage_path,
        is_active: !amenity.is_active
      })
      return !!updatedAmenity
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    fetchAmenities()
  }, [])

  return {
    amenities,
    loading,
    error,
    fetchAmenities,
    createAmenity,
    updateAmenity,
    deleteAmenity,
    toggleAmenityStatus
  }
} 