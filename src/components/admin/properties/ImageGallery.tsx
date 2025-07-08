'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Eye, Download } from 'lucide-react'
import { PropertyImage } from '@/hooks/usePropertyImages'
import { useToast } from '@/components/ui/use-toast'

interface ImageGalleryProps {
  propertyId: string
  images: PropertyImage[]
  onImagesChange: (images: PropertyImage[]) => void
  onDeleteImage?: (imageId: string) => Promise<void>
}

export function ImageGallery({ propertyId, images, onImagesChange, onDeleteImage }: ImageGalleryProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const { toast } = useToast()

  const handleDelete = async (imageId: string) => {
    try {
      setIsDeleting(true)
      
      if (onDeleteImage) {
        await onDeleteImage(imageId)
      }
      
      onImagesChange(images.filter(img => img.id !== imageId))
      toast({
        title: 'Success',
        description: 'Image deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting image:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete image',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDownload = (imageUrl: string, imageName: string) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = imageName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!images.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Eye className="h-8 w-8 opacity-50" />
        </div>
        <p className="text-lg font-medium">No images available</p>
        <p className="text-sm">Upload some images to see them here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Property Images</span>
          <Badge variant="secondary">{images.length}</Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          Hover over images for actions
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <Card key={image.id} className="relative group overflow-hidden transition-all duration-200 hover:shadow-lg">
            <CardContent className="p-0">
              <div className="aspect-square relative">
                <Image
                  src={image.image_url}
                  alt={`Property image ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setSelectedImage(image.image_url)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDownload(image.image_url, `property-image-${index + 1}.jpg`)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDelete(image.id)}
                    disabled={isDeleting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Image number badge */}
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-xs">
                    #{index + 1}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Image preview modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 z-10"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            <Image
              src={selectedImage}
              alt="Property preview"
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  )
} 