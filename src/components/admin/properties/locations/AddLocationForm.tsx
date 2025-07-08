'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, X, Save, Edit, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { supabase } from '@/lib/supabaseClient'

interface Location {
  id: string
  name: string
  description: string | null
  image_url: string | null
  image_storage_path: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface AddLocationFormProps {
  onLocationAdded: () => void
  editingLocation?: Location | null
  onCancelEdit?: () => void
}

export function AddLocationForm({ onLocationAdded, editingLocation, onCancelEdit }: AddLocationFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    image_storage_path: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  
  const { toast } = useToast()

  // Initialize form data when editing
  useEffect(() => {
    if (editingLocation) {
      setFormData({
        name: editingLocation.name,
        description: editingLocation.description || '',
        image_url: editingLocation.image_url || '',
        image_storage_path: editingLocation.image_storage_path || ''
      })
      setPreviewUrl(editingLocation.image_url)
    } else {
      // Reset form when not editing
      setFormData({
        name: '',
        description: '',
        image_url: '',
        image_storage_path: ''
      })
      setPreviewUrl(null)
      setSelectedFile(null)
    }
  }, [editingLocation])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file (JPEG, PNG, GIF, etc.)',
        variant: 'destructive',
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB',
        variant: 'destructive',
      })
      return
    }

    setSelectedFile(file)
    
    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const removeSelectedFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
  }

  const uploadImage = async (file: File): Promise<{ url: string; path: string } | null> => {
    try {
      setIsUploading(true)

      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('Authentication required')
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `location-${Date.now()}.${fileExt}`

      // Try to upload to Supabase Storage
      const { error } = await supabase.storage
        .from('location-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        // If storage bucket doesn't exist or has permission issues, skip image upload
        if (error.message?.includes('not found') || 
            error.message?.includes('policy') || 
            error.message?.includes('unauthorized') ||
            error.message?.includes('bucket') ||
            error.message?.includes('does not exist')) {
          toast({
            title: 'Storage Warning',
            description: 'Image upload skipped due to storage configuration. Location will be saved without image.',
            variant: 'default',
          })
          return { url: '', path: '' }
        }
        
        throw new Error(error.message || 'Unknown storage error')
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('location-images')
        .getPublicUrl(fileName)

      return {
        url: urlData.publicUrl,
        path: fileName
      }
    } catch (error) {
      // If it's a storage-related error, allow the form to continue without image
      if (error instanceof Error && (
        error.message.includes('storage') || 
        error.message.includes('bucket') || 
        error.message.includes('policy') ||
        error.message.includes('not found') ||
        error.message.includes('unauthorized') ||
        error.message.includes('does not exist')
      )) {
        toast({
          title: 'Storage Warning',
          description: 'Image upload failed. Location will be saved without image.',
          variant: 'default',
        })
        return { url: '', path: '' }
      }
      
      toast({
        title: 'Upload Error',
        description: error instanceof Error ? error.message : 'Failed to upload image',
        variant: 'destructive',
      })
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Location name is required',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsLoading(true)

      let imageData = { url: formData.image_url, path: formData.image_storage_path }
      
      // Upload new image if selected
      if (selectedFile) {
        const uploadResult = await uploadImage(selectedFile)
        if (!uploadResult) {
          // Don't return here, continue with empty image data
          imageData = { url: '', path: '' }
        } else {
          imageData = uploadResult
        }
      }

      const requestBody = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        image_url: imageData.url || null,
        image_storage_path: imageData.path || null,
        ...(editingLocation && { is_active: editingLocation.is_active })
      }

      let response: Response
      let result: { error?: string; [key: string]: unknown }

      if (editingLocation) {
        // Update existing location
        response = await fetch(`/api/locations/${editingLocation.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        })
        result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to update location')
        }

        toast({
          title: 'Success',
          description: 'Location updated successfully',
        })
      } else {
        // Create new location
        response = await fetch('/api/locations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        })
        result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to create location')
        }

        toast({
          title: 'Success',
          description: 'Location added successfully',
        })
      }

      // Reset form
      setFormData({
        name: '',
        description: '',
        image_url: '',
        image_storage_path: ''
      })
      removeSelectedFile()

      // Notify parent component
      onLocationAdded()

    } catch (error) {
      console.error('Error saving location:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save location',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {editingLocation ? <Edit className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
            {editingLocation ? 'Edit Location' : 'Add New Location'}
          </CardTitle>
          {editingLocation && onCancelEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCancelEdit}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Cancel Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Location Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Location Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter location name"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter location description (optional)"
              rows={3}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Location Image</Label>
            <div className="space-y-4">
              {!previewUrl ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB
                  </p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="mt-2"
                  />
                </div>
              ) : (
                <div className="relative">
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <Image
                      src={previewUrl}
                      alt="Location preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeSelectedFile}
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isLoading || isUploading}
            className="w-full"
          >
            {isLoading || isUploading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {isUploading ? 'Uploading...' : (editingLocation ? 'Updating...' : 'Adding Location...')}
              </div>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {editingLocation ? 'Update Location' : 'Add Location'}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 