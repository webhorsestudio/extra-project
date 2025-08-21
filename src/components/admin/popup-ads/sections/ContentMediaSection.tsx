'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CreatePopupAdData } from '@/types/popup-ad'
import { Image as ImageIcon, X, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface ContentMediaSectionProps {
  formData: CreatePopupAdData
  onInputChange: (field: string, value: string | number | boolean | string[] | Record<string, unknown>) => void
  onContentChange: (field: string, value: string) => void
}

export default function ContentMediaSection({
  formData,
  onInputChange,
  onContentChange
}: ContentMediaSectionProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>('')

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, GIF, etc.)')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Please select an image smaller than 5MB.')
      return
    }

    setIsUploading(true)
    setUploadProgress('Starting upload...')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'popup-ads')

      setUploadProgress('Uploading to server...')

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      setUploadProgress('Upload successful!')

      // Update the form with the uploaded image URL
      onInputChange('image_url', result.url)

      // Clear the file input
      event.target.value = ''

      // Show success message
      setTimeout(() => {
        setUploadProgress('')
      }, 2000)

    } catch (error) {
      console.error('Upload error:', error)
      setUploadProgress(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setUploadProgress('')
      }, 5000)
    } finally {
      setIsUploading(false)
    }
  }

  const clearImage = () => {
    onInputChange('image_url', '')
    setUploadProgress('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Content & Media
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Image Section */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Image</Label>
          
          {/* Simple Image Upload */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="flex-1"
              />
              {formData.image_url && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearImage}
                  className="text-red-600 hover:text-red-700"
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Upload Progress */}
            {uploadProgress && (
              <div className={`p-3 rounded-md text-sm ${
                uploadProgress.includes('failed') || uploadProgress.includes('Failed') 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : uploadProgress.includes('successful') || uploadProgress.includes('Success')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                <div className="flex items-center gap-2">
                  {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {uploadProgress}
                </div>
              </div>
            )}

            {/* Image Preview */}
            {formData.image_url && (
              <div className="space-y-2">
                <Label className="text-sm">Current Image</Label>
                <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden border">
                  <img
                    src={formData.image_url}
                    alt="Popup ad image"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.parentElement!.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500">Image failed to load</div>'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content_title">Content Title</Label>
          <Input
            id="content_title"
            value={formData.content?.title || ''}
            onChange={(e) => onContentChange('title', e.target.value)}
            placeholder="Enter content title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content_description">Description</Label>
          <Textarea
            id="content_description"
            value={formData.content?.description || ''}
            onChange={(e) => onContentChange('description', e.target.value)}
            placeholder="Enter description"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="link_url">Link URL</Label>
            <Input
              id="link_url"
              value={formData.link_url || ''}
              onChange={(e) => onInputChange('link_url', e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="link_text">Link Text</Label>
            <Input
              id="link_text"
              value={formData.link_text || ''}
              onChange={(e) => onInputChange('link_text', e.target.value)}
              placeholder="Click here"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="button_text">Button Text</Label>
          <Input
            id="button_text"
            value={formData.content?.button_text || ''}
            placeholder="Get Started"
            onChange={(e) => onContentChange('button_text', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
