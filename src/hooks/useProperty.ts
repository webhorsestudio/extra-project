import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { Property } from '@/types/property'
import { supabase } from '@/lib/supabaseClient'

// Interfaces for Supabase query results
interface AmenityRelationResult {
  amenity_id: string
  property_amenities: {
    id: string
    name: string
    image_url?: string
    image_storage_path?: string
    is_active: boolean
  } | {
    id: string
    name: string
    image_url?: string
    image_storage_path?: string
    is_active: boolean
  }[]
}

interface CategoryRelationResult {
  category_id: string
  property_categories: {
    id: string
    name: string
    icon: string
    is_active: boolean
  } | {
    id: string
    name: string
    icon: string
    is_active: boolean
  }[]
}

export function useProperty(id: string) {
  const [property, setProperty] = useState<Property | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchProperty = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Fetch basic property data with developer information
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select(`
          *,
          developer:property_developers(*)
        `)
        .eq('id', id)
        .single()

      if (propertyError) {
        throw propertyError
      }
      if (!propertyData) throw new Error('Property not found')
      
      // Fetch configurations
      const { data: configsData, error: configsError } = await supabase
        .from('property_configurations')
        .select('bhk, price, area, bedrooms, bathrooms, floor_plan_url, brochure_url, ready_by')
        .eq('property_id', id)

      if (configsError) {
        console.warn('Configurations error:', configsError)
      }

      // Fetch images
      const { data: imagesData, error: imagesError } = await supabase
        .from('property_images')
        .select('id, image_url')
        .eq('property_id', id)
      
      if (imagesError) {
        console.warn('Images error:', imagesError)
      }

      // Fetch amenities relationships
      const { data: amenitiesData, error: amenitiesError } = await supabase
        .from('property_amenity_relations')
        .select(`
          amenity_id,
          property_amenities(
            id,
            name,
            image_url,
            image_storage_path,
            is_active
          )
        `)
        .eq('property_id', id)

      if (amenitiesError) {
        console.warn('Amenities error:', amenitiesError)
      } else {
        console.log('🔍 useProperty: Amenities data fetched:', amenitiesData?.length || 0, 'relations')
        console.log('🔍 useProperty: Amenities raw data:', amenitiesData)
      }

      // Fetch categories relationships
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('property_category_relations')
        .select(`
          category_id,
          property_categories(
            id,
            name,
            icon,
            is_active
          )
        `)
        .eq('property_id', id)

      if (categoriesError) {
        console.warn('Categories error:', categoriesError)
      } else {
        console.log('🔍 useProperty: Categories data fetched:', categoriesData?.length || 0, 'relations')
        console.log('🔍 useProperty: Categories raw data:', categoriesData)
      }

      // Transform the data
      const transformedData = {
        ...propertyData,
        bhk_configurations: configsData || [],
        images: imagesData || [],
        property_images: imagesData || [],
        // Extract amenity objects from relationships with better type safety
        amenities: amenitiesData?.map((rel) => {
          const typedRel = rel as AmenityRelationResult
          if (typedRel && typedRel.property_amenities) {
            // Handle both array and single object cases
            const amenity = Array.isArray(typedRel.property_amenities) 
              ? typedRel.property_amenities[0] 
              : typedRel.property_amenities
            return amenity ? {
              name: amenity.name,
              image_url: amenity.image_url
            } : null
          }
          return null
        }).filter(Boolean) || [],
        // Extract category objects from relationships with better type safety
        categories: categoriesData?.map((rel) => {
          const typedRel = rel as CategoryRelationResult
          if (typedRel && typedRel.property_categories) {
            // Handle both array and single object cases
            const category = Array.isArray(typedRel.property_categories) 
              ? typedRel.property_categories[0] 
              : typedRel.property_categories
            return category ? {
              name: category.name,
              icon: category.icon
            } : null
          }
          return null
        }).filter((cat): cat is { name: string; icon: string } => Boolean(cat)) || [],
      }

      console.log('🔍 useProperty: Transformed amenities:', transformedData.amenities)
      console.log('🔍 useProperty: Transformed categories:', transformedData.categories)
      console.log('🔍 useProperty: Final property data:', transformedData)
      setProperty(transformedData)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch property'
      setError(message)
      console.error('Error fetching property:', error)
      toast({
        title: 'Error fetching property',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [id, toast])

  useEffect(() => {
    if (id) {
      fetchProperty()
    }
  }, [id, fetchProperty])
  
  const updateProperty = async (values: Partial<Omit<Property, 'bhk_configurations' | 'images'>>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('You must be logged in to update a property')

      const { error: updateError } = await supabase
        .from('properties')
        .update({
          ...values,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (updateError) {
        throw updateError
      }
      
      await fetchProperty()
      
      toast({
        title: 'Success',
        description: 'Property updated successfully',
      })
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update property'
      setError(message)
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
      return false
    }
  }

  // Update property amenities
  const updateAmenities = async (amenityNames: string[]) => {
    try {
      // First, get amenity IDs from names
      const { data: amenities, error: fetchError } = await supabase
        .from('property_amenities')
        .select('id, name')
        .in('name', amenityNames)

      if (fetchError) {
        throw fetchError
      }

      const amenityIds = amenities?.map(a => a.id) || []

      // Delete existing relationships
      const { error: deleteError } = await supabase
        .from('property_amenity_relations')
        .delete()
        .eq('property_id', id)

      if (deleteError) {
        throw deleteError
      }

      // Insert new relationships
      if (amenityIds.length > 0) {
        const relations = amenityIds.map(amenityId => ({
          property_id: id,
          amenity_id: amenityId
        }))

        const { error: insertError } = await supabase
          .from('property_amenity_relations')
          .insert(relations)

        if (insertError) {
          throw insertError
        }
      }

      await fetchProperty()
      
      toast({
        title: 'Success',
        description: 'Property amenities updated successfully',
      })
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update amenities'
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
      return false
    }
  }

  // Update property categories
  const updateCategories = async (categoryNames: string[]) => {
    try {
      // First, get category IDs from names
      const { data: categories, error: fetchError } = await supabase
        .from('property_categories')
        .select('id, name')
        .in('name', categoryNames)

      if (fetchError) {
        throw fetchError
      }

      const categoryIds = categories?.map(c => c.id) || []

      // Delete existing relationships
      const { error: deleteError } = await supabase
        .from('property_category_relations')
        .delete()
        .eq('property_id', id)

      if (deleteError) {
        throw deleteError
      }

      // Insert new relationships
      if (categoryIds.length > 0) {
        const relations = categoryIds.map(categoryId => ({
          property_id: id,
          category_id: categoryId
        }))

        const { error: insertError } = await supabase
          .from('property_category_relations')
          .insert(relations)

        if (insertError) {
          throw insertError
        }
      }

      await fetchProperty()
      
      toast({
        title: 'Success',
        description: 'Property categories updated successfully',
      })
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update categories'
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
      return false
    }
  }

  const deleteProperty = async () => {
    try {
      const { error } = await supabase.rpc('delete_property', { property_id_input: id })
      if (error) throw error
      
      setProperty(null)
      toast({
        title: 'Success',
        description: 'Property deleted successfully',
      })
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete property'
      setError(message)
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
      return false
    }
  }

  return {
    property,
    isLoading,
    error,
    updateProperty,
    updateAmenities,
    updateCategories,
    deleteProperty,
    refetch: fetchProperty,
  }
} 