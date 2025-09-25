'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import * as z from 'zod'
import { useProperty } from '@/hooks/useProperty'
import { PropertyForm } from '@/components/admin/properties/PropertyForm'
import { updatePropertyAmenityRelations, updatePropertyCategoryRelations } from '@/lib/property-relationships'
import { toast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabaseClient'
import { use } from 'react';

// Form schema definition - used for type inference and validation
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  property_type: z.enum(['House', 'Apartment', 'Commercial', 'Land', 'Villa', 'Penthouse'], {
    required_error: 'Property type is required',
  }),
  property_nature: z.enum(['Sell', 'Rent'], {
    required_error: 'Property nature is required',
  }),
  property_collection: z.enum(['Newly Launched', 'Featured', 'Ready to Move', 'Under Construction'], {
    required_error: 'Property collection is required',
  }),
  location_id: z.string().min(1, 'Location selection is required'),
  location: z.string().optional(),
  amenities: z.array(z.object({
    name: z.string(),
    image_url: z.string().optional(),
  })).optional(),
  categories: z.array(z.object({
    name: z.string(),
    icon: z.string().optional(),
  })).optional(),
  has_rera: z.boolean(),
  rera_number: z.string().optional(),
  bhk_configurations: z.array(z.object({
    id: z.string().optional(),
    bhk: z.number().min(1, 'BHK is required'),
    price: z.preprocess(val => (val === '' ? undefined : val === undefined ? undefined : Number(val)), z.number().optional()),
    area: z.number().min(0, 'Area must be 0 or greater'),
    bedrooms: z.number().min(0, 'Bedrooms must be 0 or greater'),
    bathrooms: z.number().min(0, 'Bathrooms must be 0 or greater'),
    floor_plan_url: z.string().optional(),
    brochure_url: z.string().optional(),
    ready_by: z.string().optional(),
  })).min(1, 'At least one BHK configuration is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  posted_by: z.string().min(1, 'Posted by is required'),
  developer_id: z.string().optional(),
  video_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
})

export default function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter()

  // Fetch property data
  const { property, isLoading: isPropertyLoading, updateProperty } = useProperty(id)

  const handleUpdateProperty = async (values: z.infer<typeof formSchema>) => {
    if (!property) return

    console.log('Edit Property - Starting update with values:', values)
    console.log('Edit Property - Property ID:', property.id)

    try {
      const updatedData = {
        title: values.title,
        description: values.description,
        property_type: values.property_type,
        property_nature: values.property_nature,
        property_collection: values.property_collection,
        location_id: values.location_id,
        location: values.location || '',
        latitude: values.latitude,
        longitude: values.longitude,
        rera_number: values.has_rera && values.rera_number ? values.rera_number : undefined,
        video_url: values.video_url && values.video_url.trim() !== '' ? values.video_url : null,
        posted_by: values.posted_by,
        developer_id: values.developer_id || undefined,
      }
      
      console.log('Edit Property - Updated data to send:', updatedData)
      
      const success = await updateProperty(updatedData)

      console.log('Edit Property - Update result:', success)

      if (!success) {
        throw new Error('Failed to update property details.')
      }
      
      // Update BHK configurations
      console.log('Edit Property - Updating BHK configurations:', values.bhk_configurations)
      await updateBHKConfigurations(values.bhk_configurations)
      
      // Update amenities using helper function
      console.log('Edit Property - Updating amenities:', values.amenities)
      if (values.amenities) {
        // Extract amenity names from objects for the update function
        const amenityNames = values.amenities.map(amenity => amenity.name)
        const amenityResult = await updatePropertyAmenityRelations(property.id, amenityNames)
        if (!amenityResult.success) {
          console.error('Error updating amenity relationships:', amenityResult.error)
          toast({
            title: 'Warning',
            description: 'Property updated but amenities failed to save',
            variant: 'destructive',
          })
        }
      }
      
      // Update categories using helper function
      console.log('Edit Property - Updating categories:', values.categories)
      if (values.categories) {
        // Extract category names from objects for the update function
        const categoryNames = values.categories.map(cat => cat.name)
        const categoryResult = await updatePropertyCategoryRelations(property.id, categoryNames)
        if (!categoryResult.success) {
          console.error('Error updating category relationships:', categoryResult.error)
          toast({
            title: 'Warning',
            description: 'Property updated but categories failed to save',
            variant: 'destructive',
          })
        }
      }
      
      toast({
        title: 'Success',
        description: 'Property updated successfully.',
      })
      router.push('/admin/properties')
      router.refresh()
    } catch (error) {
      console.error('Edit Property - Error updating property:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update property.',
        variant: 'destructive',
      })
    }
  }
  
  const updateBHKConfigurations = async (configurations: z.infer<typeof formSchema>['bhk_configurations']) => {
    if (!property) return
    
    try {
      // Delete existing configurations
      const { error: deleteError } = await supabase
        .from('property_configurations')
        .delete()
        .eq('property_id', property.id)
        
      if (deleteError) {
        console.error('Delete error:', deleteError)
        throw new Error(`Failed to delete old configurations: ${deleteError.message}`)
      }
      
      // Insert new configurations with proper data handling
      const newConfigs = configurations.map(config => ({
        bhk: config.bhk,
        price: config.price,
        area: config.area,
        bedrooms: config.bedrooms,
        bathrooms: config.bathrooms,
        floor_plan_url: config.floor_plan_url || null,
        brochure_url: config.brochure_url || null,
        ready_by: config.ready_by || null,
        property_id: property.id,
      }))
      
      const { error: insertError } = await supabase
        .from('property_configurations')
        .insert(newConfigs)
        .select()
        
      if (insertError) {
        console.error('Insert error details:', insertError)
        console.error('Insert error code:', insertError.code)
        console.error('Insert error message:', insertError.message)
        console.error('Insert error details:', insertError.details)
        console.error('Insert error hint:', insertError.hint)
        console.error('Full insert error object:', JSON.stringify(insertError, null, 2))
        throw new Error(`Failed to insert new configurations: ${insertError.message}`)
      }
    } catch (error) {
      console.error('Error in updateBHKConfigurations:', error)
      throw error
    }
  }

  const handleCancel = () => {
    router.back()
  }

  if (isPropertyLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-10 w-1/3 bg-muted rounded mb-6"></div>
          <div className="space-y-6">
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center">
        <p>Property not found.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <PropertyForm
        key={property?.id || 'new'}
        property={property}
        onSubmit={handleUpdateProperty}
        onCancel={handleCancel}
        isSubmitting={isPropertyLoading}
      />
    </div>
  )
} 