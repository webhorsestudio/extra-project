"use client"

import { useState } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface AdminPropertyImageGalleryProps {
  images: { image_url: string }[]
  propertyTitle: string
}

export default function AdminPropertyImageGallery({ images, propertyTitle }: AdminPropertyImageGalleryProps) {
  const [preview, setPreview] = useState<string | null>(null)

  if (!images.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <X className="h-8 w-8 opacity-50" />
        </div>
        <p className="text-lg font-medium">No images available</p>
        <p className="text-sm">No property images to display</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img, idx) => (
          <div
            key={img.image_url + idx}
            className="relative group cursor-pointer rounded-lg overflow-hidden border bg-muted"
            onClick={() => setPreview(img.image_url)}
            tabIndex={0}
            aria-label={`Preview image ${idx + 1}`}
          >
            <Image
              src={img.image_url}
              alt={`${propertyTitle} image ${idx + 1}`}
              width={400}
              height={300}
              className="object-cover w-full h-32 sm:h-40 md:h-48 transition-transform duration-200 group-hover:scale-105"
            />
            <Badge className="absolute top-2 left-2 text-xs bg-white/80 text-black">{idx + 1}</Badge>
          </div>
        ))}
      </div>
      {/* Modal Preview */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setPreview(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] p-4">
            <button
              type="button"
              className="absolute top-2 right-2 h-8 w-8 z-10 bg-white/80 rounded-full flex items-center justify-center"
              onClick={() => setPreview(null)}
              aria-label="Close preview"
            >
              <X className="h-5 w-5 text-black" />
            </button>
            <Image
              src={preview}
              alt="Property preview"
              width={900}
              height={700}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-lg"
            />
          </div>
        </div>
      )}
    </div>
  )
} 