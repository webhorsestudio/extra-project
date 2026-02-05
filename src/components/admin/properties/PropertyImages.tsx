'use client'

import { useFormContext } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ImageUploader } from './ImageUploader'
import { ImageGallery } from './ImageGallery'
import { PropertyImage, usePropertyImages } from '@/hooks/usePropertyImages'
import { Image, Upload, AlertCircle, ChevronUp, ChevronDown, Video, ExternalLink } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

interface PropertyImagesProps {
  propertyId?: string
  images?: PropertyImage[]
  onImagesChange?: (images: PropertyImage[]) => void
  onTempImagesChange?: (files: File[]) => void
  tempImages?: File[]
}

export function PropertyImages({ 
  propertyId, 
  images: propImages = [], 
  onImagesChange,
  onTempImagesChange,
  tempImages = []
}: PropertyImagesProps) {
  const form = useFormContext()
  const { images, isLoading, error, deleteImage, reorderImage } = usePropertyImages(propertyId || '')

  // Use images from hook if propertyId is provided, otherwise use prop images
  const displayImages = propertyId ? images : propImages

  const handleImagesChange = (files: File[]) => {
    // For new properties, store temporary images
    if (!propertyId && onTempImagesChange) {
      onTempImagesChange(files)
    }
    
    // Call parent callback if provided
    if (onImagesChange) {
      onImagesChange(displayImages)
    }
  }

  const handleGalleryChange = (updatedImages: PropertyImage[]) => {
    // Call parent callback if provided
    if (onImagesChange) {
      onImagesChange(updatedImages)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (propertyId && deleteImage) {
      await deleteImage(imageId)
    }
  }

  const handleReorderTempImage = (index: number, direction: 'up' | 'down') => {
    if (!onTempImagesChange) return
    
    const newFiles = [...tempImages]
    let targetIndex: number
    
    if (direction === 'up' && index > 0) {
      targetIndex = index - 1
    } else if (direction === 'down' && index < tempImages.length - 1) {
      targetIndex = index + 1
    } else {
      return // Can't move further in that direction
    }
    
    // Swap files
    [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]]
    onTempImagesChange(newFiles)
  }

  // Show upload interface for new properties with temporary images
  if (!propertyId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Property Images & Video
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload high-quality images and add a video URL to showcase your property
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Images will be uploaded when you save the property. You can add, remove, or reorder images before saving.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Upload className="h-4 w-4" />
              <span>Upload images for your property</span>
            </div>
            
            <ImageUploader 
              propertyId={propertyId}
              onImagesChange={handleImagesChange}
              maxFiles={10}
              className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors"
            />
          </div>

          {/* Video URL Field */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Video className="h-4 w-4" />
              <span>Property Video (Optional)</span>
            </div>
            
            <FormField
              control={form.control}
              name="video_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Video URL
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="pr-10"
                      />
                      {field.value && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1 h-8 w-8"
                          onClick={() => window.open(field.value, '_blank')}
                          title="Open video in new tab"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Add a YouTube or other video URL to showcase your property
                  </p>
                </FormItem>
              )}
            />
          </div>

          {tempImages.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Selected Images ({tempImages.length})</h4>
                <span className="text-xs text-muted-foreground">
                  These will be uploaded when you save the property
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {tempImages.map((file, index) => (
                  <div key={`temp-${index}`} className="relative group aspect-square">
                    <div className="absolute inset-0 rounded-lg overflow-hidden">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                        {/* Reorder buttons */}
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleReorderTempImage(index, 'up')}
                          disabled={index === 0}
                          title="Move up"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleReorderTempImage(index, 'down')}
                          disabled={index === tempImages.length - 1}
                          title="Move down"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            const newFiles = tempImages.filter((_, i) => i !== index)
                            onTempImagesChange?.(newFiles)
                          }}
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                    
                    {/* Image number */}
                    <div className="absolute top-2 left-2">
                      <span className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded">
                        #{index + 1}
                      </span>
                    </div>
                    
                    {/* File name */}
                    <div className="absolute bottom-2 left-2 right-2">
                      <span className="bg-black/70 text-white text-xs px-2 py-1 rounded truncate block">
                        {file.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Property Images & Video
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Upload high-quality images and add a video URL to showcase your property
        </p>
        {error && (
          <p className="text-sm text-red-600">
            Error loading images: {error.message}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Upload className="h-4 w-4" />
            <span>Upload new images</span>
          </div>
          
          <ImageUploader 
            key={propertyId}
            propertyId={propertyId}
            onImagesChange={handleImagesChange}
            maxFiles={10}
            className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors"
          />
        </div>

        {/* Video URL Field */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Video className="h-4 w-4" />
            <span>Property Video (Optional)</span>
          </div>
          
          <FormField
            control={form.control}
            name="video_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Video URL
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="pr-10"
                    />
                    {field.value && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-8 w-8"
                        onClick={() => window.open(field.value, '_blank')}
                        title="Open video in new tab"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
                <p className="text-xs text-muted-foreground">
                  Add a YouTube or other video URL to showcase your property
                </p>
              </FormItem>
            )}
          />
        </div>

        {isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="w-8 h-8 mx-auto mb-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p>Loading images...</p>
          </div>
        )}

        {!isLoading && displayImages.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Uploaded Images ({displayImages.length})</h4>
              <span className="text-xs text-muted-foreground">
                Click on images to delete them
              </span>
            </div>
            
            <ImageGallery
              key={`gallery-${propertyId}-${displayImages.length}`}
              images={displayImages}
              onImagesChange={handleGalleryChange}
              onDeleteImage={handleDeleteImage}
              onReorderImage={reorderImage}
            />
          </div>
        )}

        {!isLoading && displayImages.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No images uploaded yet</p>
            <p className="text-sm">Upload some images to see them here</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 