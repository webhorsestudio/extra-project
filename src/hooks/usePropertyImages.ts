import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabaseClient'

export interface PropertyImage {
  id: string
  property_id: string
  image_url: string
  display_order: number
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
        .order('display_order', { ascending: true })
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

      // Get the highest display_order and add 1
      const maxOrder = images.length > 0 ? Math.max(...images.map(img => img.display_order)) : 0
      const newOrder = maxOrder + 1

      const { data, error } = await supabase
        .from('property_images')
        .insert([{ 
          property_id: propertyId, 
          image_url: publicUrl,
          display_order: newOrder
        }])
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('Failed to insert image record')

      setImages(prev => [...prev, data])
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

  const reorderImage = async (imageId: string, direction: 'up' | 'down'): Promise<void> => {
    try {
      const currentIndex = images.findIndex(img => img.id === imageId)
      if (currentIndex === -1) throw new Error('Image not found')

      let targetIndex: number
      if (direction === 'up' && currentIndex > 0) {
        targetIndex = currentIndex - 1
      } else if (direction === 'down' && currentIndex < images.length - 1) {
        targetIndex = currentIndex + 1
      } else {
        return // Can't move further in that direction
      }

      const currentImage = images[currentIndex]
      const targetImage = images[targetIndex]

      // Swap display_order values
      const { error: error1 } = await supabase
        .from('property_images')
        .update({ display_order: targetImage.display_order })
        .eq('id', currentImage.id)

      if (error1) throw error1

      const { error: error2 } = await supabase
        .from('property_images')
        .update({ display_order: currentImage.display_order })
        .eq('id', targetImage.id)

      if (error2) throw error2

      // Update local state
      const newImages = [...images]
      newImages[currentIndex] = { ...currentImage, display_order: targetImage.display_order }
      newImages[targetIndex] = { ...targetImage, display_order: currentImage.display_order }
      
      // Sort by display_order
      newImages.sort((a, b) => a.display_order - b.display_order)
      setImages(newImages)
    } catch (err) {
      console.error('Error in reorderImage:', err)
      throw err instanceof Error ? err : new Error('Failed to reorder image')
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
    reorderImage,
  }
} 