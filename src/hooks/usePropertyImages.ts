import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabaseClient'

export interface PropertyImage {
  id: string
  property_id: string
  image_url: string
  created_at: string
}

export function usePropertyImages(propertyId: string) {
  const [images, setImages] = useState<PropertyImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  useToast();

  const fetchImages = useCallback(async () => {
    if (!propertyId) return
    
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setImages(data || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch images'))
    } finally {
      setIsLoading(false)
    }
  }, [propertyId])

  const uploadImage = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${propertyId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath)

      const { data, error } = await supabase
        .from('property_images')
        .insert([{ property_id: propertyId, image_url: publicUrl }])
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('Failed to insert image record')

      setImages(prev => [data, ...prev])
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to upload image')
    }
  }

  const deleteImage = async (imageId: string) => {
    try {
      const image = images.find(img => img.id === imageId)
      if (!image) throw new Error('Image not found')

      // Delete from storage
      const filePath = image.image_url.split('/').pop()
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from('property-images')
          .remove([`${propertyId}/${filePath}`])

        if (storageError) {
          console.error('Error deleting from storage:', storageError)
          throw storageError
        }
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('property_images')
        .delete()
        .eq('id', imageId)

      if (dbError) {
        console.error('Error deleting from database:', dbError)
        throw dbError
      }

      // Update local state
      setImages(prev => prev.filter(img => img.id !== imageId))
      
      return true
    } catch (err) {
      console.error('Error in deleteImage:', err)
      throw err instanceof Error ? err : new Error('Failed to delete image')
    }
  }

  useEffect(() => {
    if (propertyId) {
      fetchImages()
    } else {
      setImages([])
      setIsLoading(false)
    }
  }, [propertyId, fetchImages])

  return {
    images,
    isLoading,
    error,
    uploadImage,
    deleteImage,
  }
} 