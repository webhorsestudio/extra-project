'use client'

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ImagePlus, X, Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { supabase } from '@/lib/supabaseClient'

interface ImageUploaderProps {
  propertyId?: string
  onImagesChange: (files: File[]) => void
  maxFiles?: number
  className?: string
}

export function ImageUploader({
  propertyId,
  onImagesChange,
  maxFiles = 10,
  className,
}: ImageUploaderProps) {
  const [previews, setPreviews] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})

  const uploadFileToSupabase = async (file: File, index: number): Promise<string | null> => {
    if (!propertyId) {
      toast.error('Property ID is required for image upload')
      return null
    }

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${propertyId}/${fileName}`

      // Update progress
      setUploadProgress(prev => ({ ...prev, [index]: 0 }))

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        toast.error(`Failed to upload ${file.name}: ${uploadError.message}`)
        return null
      }

      // Update progress to 100%
      setUploadProgress(prev => ({ ...prev, [index]: 100 }))

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath)

      // Insert into property_images table
      const { data: _imageData, error: dbError } = await supabase
        .from('property_images')
        .insert([{ 
          property_id: propertyId, 
          image_url: publicUrl 
        }])
        .select()
        .single()

      if (dbError) {
        console.error('Database error:', dbError)
        toast.error(`Failed to save image record: ${dbError.message}`)
        return null
      }

      toast.success(`${file.name} uploaded successfully!`)
      return publicUrl

    } catch (error) {
      console.error('Upload error:', error)
      toast.error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return null
    }
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > maxFiles) {
        toast.error(`You can only upload up to ${maxFiles} images`)
        return
      }

      setIsUploading(true)
      setUploadProgress({})

      try {
        // Create previews immediately
        const newPreviews = acceptedFiles.map((file) => URL.createObjectURL(file))
        setPreviews((prev) => [...prev, ...newPreviews].slice(0, maxFiles))

        // If we have a propertyId, upload to Supabase
        if (propertyId) {
          // Upload files to Supabase
          const uploadPromises = acceptedFiles.map((file, index) => 
            uploadFileToSupabase(file, index)
          )

          const uploadedUrls = await Promise.all(uploadPromises)
          const successfulUploads = uploadedUrls.filter(url => url !== null)

          if (successfulUploads.length > 0) {
            // Call the parent callback to refresh images
            onImagesChange(acceptedFiles)
            toast.success(`${successfulUploads.length} image(s) uploaded successfully!`)
          }
        } else {
          // For new properties, just pass the files to parent for temporary storage
          onImagesChange(acceptedFiles)
          toast.success(`${acceptedFiles.length} image(s) selected for upload when property is saved!`)
        }

      } catch (error) {
        console.error('Upload error:', error)
        toast.error('Failed to upload images')
      } finally {
        setIsUploading(false)
        setUploadProgress({})
      }
    },
    [maxFiles, onImagesChange, propertyId, uploadFileToSupabase]
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles,
    maxSize: 5 * 1024 * 1024, // 5MB
  })

  const removeImage = (index: number) => {
    setPreviews((prev) => {
      const newPreviews = prev.filter((_, i) => i !== index)
      return newPreviews
    })
  }

  const remainingSlots = maxFiles - previews.length

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Status */}
      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Uploading images...</span>
        </div>
      )}

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? isDragReject
              ? "border-destructive bg-destructive/5"
              : "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-4">
          <div className={`p-4 rounded-full ${
            isDragActive 
              ? isDragReject 
                ? "bg-destructive/10 text-destructive" 
                : "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          }`}>
            {isDragActive ? (
              isDragReject ? (
                <AlertCircle className="h-12 w-12" />
              ) : (
                <Upload className="h-12 w-12" />
              )
            ) : (
              <ImagePlus className="h-12 w-12" />
            )}
          </div>
          
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {isDragActive
                ? isDragReject
                  ? "Invalid file type"
                  : "Drop the images here"
                : "Drag & drop images here"}
            </p>
            <p className="text-sm text-muted-foreground">
              {isDragActive
                ? isDragReject
                  ? "Please select valid image files"
                  : "Release to upload"
                : "or click to select files"}
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span>Max {maxFiles} images</span>
              <span>•</span>
              <span>Max 5MB each</span>
              <span>•</span>
              <span>JPEG, PNG, WebP</span>
            </div>
          </div>
        </div>
      </div>

      {/* File Count Badge */}
      {previews.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Selected Images:</span>
            <Badge variant="secondary">{previews.length}</Badge>
            {remainingSlots > 0 && (
              <span className="text-xs text-muted-foreground">
                ({remainingSlots} slots remaining)
              </span>
            )}
          </div>
          {remainingSlots === 0 && (
            <Badge variant="destructive" className="text-xs">
              Max files reached
            </Badge>
          )}
        </div>
      )}

      {/* Image Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {previews.map((preview, index) => (
            <div key={preview} className="relative group aspect-square">
              <div className="absolute inset-0 rounded-lg overflow-hidden">
                <Image
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Image number */}
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="text-xs">
                  #{index + 1}
                </Badge>
              </div>
              
              {/* Upload status */}
              <div className="absolute top-2 right-2">
                {uploadProgress[index] !== undefined ? (
                  uploadProgress[index] === 100 ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  )
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 