'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreatePopupAdData } from '@/types/popup-ad'
import { Eye } from 'lucide-react'

interface PreviewSectionProps {
  formData: CreatePopupAdData
}

export default function PreviewSection({ formData }: PreviewSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          <p><strong>Type:</strong> {formData.type}</p>
          <p><strong>Position:</strong> {formData.position}</p>
          <p><strong>Delay:</strong> {formData.display_delay}s</p>
          <p><strong>Duration:</strong> {formData.display_duration === 0 ? 'Until dismissed' : `${formData.display_duration}s`}</p>
        </div>

        {formData.image_url && (
          <div className="relative h-24 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={formData.image_url}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="text-sm">
          {formData.content?.title && (
            <p className="font-medium">{formData.content.title}</p>
          )}
          {formData.content?.description && (
            <p className="text-gray-600">{formData.content.description}</p>
          )}
          {formData.content?.button_text && (
            <Button variant="outline" size="sm" className="w-full mt-2">
              {formData.content.button_text}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
