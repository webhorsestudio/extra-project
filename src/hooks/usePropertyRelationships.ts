import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabaseClient'

export function usePropertyRelationships(propertyId: string) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Update property amenities
  const updateAmenities = async (amenityIds: string[]) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/properties/${propertyId}/amenities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amenity_ids: amenityIds }),
      })

      if (!response.ok) {
        throw new Error('Failed to update amenities')
      }

      toast({
        title: 'Success',
        description: 'Property amenities updated successfully',
      })

      return true
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update amenities',
        variant: 'destructive',
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Update property categories
  const updateCategories = async (categoryIds: string[]) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/properties/${propertyId}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category_ids: categoryIds }),
      })

      if (!response.ok) {
        throw new Error('Failed to update categories')
      }

      toast({
        title: 'Success',
        description: 'Property categories updated successfully',
      })

      return true
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update categories',
        variant: 'destructive',
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Track property view
  const trackView = async () => {
    try {
      await fetch(`/api/properties/${propertyId}/views`, {
        method: 'POST',
      })
    } catch (_error) {
      // Silently fail for view tracking
      console.error('Failed to track view:', _error)
    }
  }

  // Toggle favorite
  const toggleFavorite = async () => {
    try {
      // Check if already favorited
      const { data: existing } = await supabase
        .from('property_favorites')
        .select('id')
        .eq('property_id', propertyId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single()

      if (existing) {
        // Remove from favorites
        const response = await fetch(`/api/properties/${propertyId}/favorites`, {
          method: 'DELETE',
        })

        if (response.ok) {
          toast({
            title: 'Removed from favorites',
            description: 'Property removed from your favorites',
          })
          return false
        }
      } else {
        // Add to favorites
        const response = await fetch(`/api/properties/${propertyId}/favorites`, {
          method: 'POST',
        })

        if (response.ok) {
          toast({
            title: 'Added to favorites',
            description: 'Property added to your favorites',
          })
          return true
        }
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update favorites',
        variant: 'destructive',
      })
    }
    return null
  }

  // Add review
  const addReview = async (rating: number, reviewText?: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/properties/${propertyId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating, review_text: reviewText }),
      })

      if (!response.ok) {
        throw new Error('Failed to add review')
      }

      toast({
        title: 'Success',
        description: 'Review added successfully',
      })

      return true
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add review',
        variant: 'destructive',
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Update review
  const updateReview = async (rating: number, reviewText?: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/properties/${propertyId}/reviews`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating, review_text: reviewText }),
      })

      if (!response.ok) {
        throw new Error('Failed to update review')
      }

      toast({
        title: 'Success',
        description: 'Review updated successfully',
      })

      return true
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update review',
        variant: 'destructive',
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Delete review
  const deleteReview = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/properties/${propertyId}/reviews`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete review')
      }

      toast({
        title: 'Success',
        description: 'Review deleted successfully',
      })

      return true
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete review',
        variant: 'destructive',
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    updateAmenities,
    updateCategories,
    trackView,
    toggleFavorite,
    addReview,
    updateReview,
    deleteReview,
  }
} 