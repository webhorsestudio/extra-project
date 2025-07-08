'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X } from 'lucide-react'
import Image from 'next/image'
import { Amenity } from '@/types/amenity'

interface EditAmenityFormProps {
  onAmenityUpdated: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
  amenity: Amenity
}

export function EditAmenityForm({ onAmenityUpdated, open, onOpenChange, amenity }: EditAmenityFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: amenity.name,
    image_url: amenity.image_url || '',
    image_storage_path: amenity.image_storage_path || ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (open && amenity) {
      setFormData({
        name: amenity.name,
        image_url: amenity.image_url || '',
        image_storage_path: amenity.image_storage_path || ''
      })
      setPreviewUrl(null)
      setSelectedFile(null)
    }
  }, [open, amenity])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file type', description: 'Please select an image file.', variant: 'destructive' })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max size is 5MB.', variant: 'destructive' })
      return
    }
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const removeSelectedFile = () => {
    setSelectedFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
  }

  const uploadImage = async (file: File): Promise<{ url: string; path: string } | null> => {
    try {
      setIsUploading(true)
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) throw new Error('Authentication required')
      
      const fileExt = file.name.split('.').pop()
      const fileName = `amenity-${Date.now()}.${fileExt}`
      
      const { data: _data, error } = await supabase.storage
        .from('amenity-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false })
      
      if (error) throw new Error(error.message)
      
      const { data: urlData } = supabase.storage.from('amenity-images').getPublicUrl(fileName)
      return { url: urlData.publicUrl, path: fileName }
    } catch (error) {
      toast({ title: 'Upload Error', description: error instanceof Error ? error.message : 'Failed to upload image', variant: 'destructive' })
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    let image_url = formData.image_url
    let image_storage_path = formData.image_storage_path
    
    // If a new file is selected, upload it
    if (selectedFile) {
      const upload = await uploadImage(selectedFile)
      if (upload) {
        image_url = upload.url
        image_storage_path = upload.path
      }
    }

    const res = await fetch(`/api/amenities/${amenity.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: formData.name, 
        image_url, 
        image_storage_path,
        is_active: amenity.is_active
      })
    })
    
    setIsLoading(false)
    
    if (!res.ok) {
      const data = await res.json()
      toast({ title: 'Error', description: data.error || 'Failed to update amenity', variant: 'destructive' })
      return
    }
    
    toast({ title: 'Amenity updated', variant: 'default' })
    onAmenityUpdated()
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 ${open ? '' : 'hidden'}`}>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Edit Amenity</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="amenity-name">Amenity Name</Label>
              <Input
                id="amenity-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={isLoading || isUploading}
                placeholder="e.g. Swimming Pool"
              />
            </div>
            
            <div>
              <Label>Image</Label>
              <div className="space-y-3 mt-1">
                {/* Current image */}
                {formData.image_url && !selectedFile && (
                  <div className="flex items-center gap-3">
                    <Image src={formData.image_url} alt="Current" width={48} height={48} className="rounded border" />
                    <span className="text-sm text-muted-foreground">Current image</span>
                  </div>
                )}
                
                {/* File input */}
                <div className="flex items-center gap-3">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={isLoading || isUploading}
                  />
                  {previewUrl && (
                    <div className="relative">
                      <Image src={previewUrl} alt="Preview" width={48} height={48} className="rounded border" />
                      <button type="button" onClick={removeSelectedFile} className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow">
                        <X className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading || isUploading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || isUploading || !formData.name}>
                {isLoading ? 'Updating...' : 'Update Amenity'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 