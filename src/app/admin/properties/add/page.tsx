'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabaseClient'
import { PropertyForm } from '@/components/admin/properties/PropertyForm'
import { createPropertyAmenityRelations, createPropertyCategoryRelations } from '@/lib/property-relationships'
import * as z from 'zod'
import { formSchema } from '@/components/admin/properties/PropertyForm'

type User = {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
  }
}

type PropertyFormData = z.infer<typeof formSchema> & { tempImages?: File[] }

export default function AddPropertyPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      } else {
        router.push('/users/login')
      }
    }
    fetchUser()
  }, [router])

  const handleSubmit = async (data: PropertyFormData) => {
    try {
      setIsSubmitting(true)
      
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to add a property',
          variant: 'destructive',
        })
        return
      }
      
      // Clean and prepare property data
      const propertyData = {
        title: data.title,
        description: data.description,
        property_type: data.property_type,
        property_nature: data.property_nature,
        property_collection: data.property_collection || 'Featured',
        location_id: data.location_id,
        location: data.location,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        rera_number: data.has_rera && data.rera_number ? data.rera_number : null,
        created_by: user.id,
        posted_by: data.posted_by,
        developer_id: data.developer_id || null,
        // Admin-created properties are automatically active and verified
        status: 'active',
        is_verified: true,
        verified_at: new Date().toISOString(),
        verified_by: user.id,
      }
      
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert(propertyData)
        .select()
        .single()

      if (propertyError) {
        throw propertyError
      }
      
      // Clean and prepare BHK configurations
      const bhkConfigs = data.bhk_configurations.map((config) => ({
        bhk: config.bhk,
        price: config.price || 0,
        area: config.area,
        bedrooms: config.bedrooms,
        bathrooms: config.bathrooms,
        floor_plan_url: config.floor_plan_url && config.floor_plan_url.trim() !== '' ? config.floor_plan_url : null,
        brochure_url: config.brochure_url && config.brochure_url.trim() !== '' ? config.brochure_url : null,
        ready_by: config.ready_by && config.ready_by.trim() !== '' ? config.ready_by : null,
        property_id: property.id,
      }))
      
      const { error: bhkError } = await supabase
        .from('property_configurations')
        .insert(bhkConfigs)
        .select()
        
      if (bhkError) {
        throw bhkError
      }

      // Upload temporary images if any
      if (data.tempImages && data.tempImages.length > 0) {
        const uploadPromises = data.tempImages.map(async (file: File) => {
          try {
            // Create unique filename
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
            const filePath = `${property.id}/${fileName}`

            // Upload to Supabase storage
            const { error: uploadError } = await supabase.storage
              .from('property-images')
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
              })

            if (uploadError) {
              throw uploadError
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('property-images')
              .getPublicUrl(filePath)

            // Insert into property_images table
            const { data: imageData, error: dbError } = await supabase
              .from('property_images')
              .insert([{ 
                property_id: property.id, 
                image_url: publicUrl 
              }])
              .select()
              .single()

            if (dbError) {
              throw dbError
            }

            return imageData
                  } catch {
          throw new Error('Image upload failed')
        }
        })

        try {
          await Promise.all(uploadPromises)
        } catch {
          // Don't throw here, property was created successfully
          toast({
            title: 'Warning',
            description: 'Property created but some images failed to upload',
            variant: 'destructive',
          })
        }
      }

      // Handle amenities relationships
      if (data.amenities && data.amenities.length > 0) {
        const amenityResult = await createPropertyAmenityRelations(property.id, data.amenities)
        if (!amenityResult.success) {
          console.error('Error creating amenity relationships:', amenityResult.error)
          toast({
            title: 'Warning',
            description: 'Property created but amenities failed to save',
            variant: 'destructive',
          })
        }
      }

      // Handle categories relationships
      if (data.categories && data.categories.length > 0) {
        const categoryResult = await createPropertyCategoryRelations(property.id, data.categories)
        if (!categoryResult.success) {
          console.error('Error creating category relationships:', categoryResult.error)
          toast({
            title: 'Warning',
            description: 'Property created but categories failed to save',
            variant: 'destructive',
          })
        }
      }

      toast({
        title: 'Success',
        description: 'Property added successfully',
      })
      router.push('/admin/properties')
      router.refresh()
    } catch (error) {
      let errorMessage = 'Failed to add property'
      
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'object' && error !== null) {
        if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message
        } else if ('details' in error && typeof error.details === 'string') {
          errorMessage = error.details
        }
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PropertyForm
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
      isSubmitting={isSubmitting}
    />
  )
} 
