'use client'

import { useState } from 'react'

import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DeveloperFormFields } from './forms/DeveloperFormFields'
import { DeveloperFormData } from '@/types/developer'

interface AddDeveloperFormProps {
  onDeveloperAdded: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddDeveloperForm({ onDeveloperAdded, open, onOpenChange }: AddDeveloperFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState<DeveloperFormData>({
    name: '',
    website: '',
    address: '',
    logo_url: '',
    logo_storage_path: '',
    contact_info: {
      phone: '',
      email: '',
      office_hours: ''
    }
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const { toast } = useToast()

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

  const uploadLogo = async (file: File): Promise<{ url: string; path: string } | null> => {
    try {
      setIsUploading(true)
      
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'developer-logos')
      formData.append('fileName', `developer-logo-${Date.now()}.${file.name.split('.').pop()}`)
      
      // Upload via API route to avoid RLS issues
      const res = await fetch('/api/upload/logo', {
        method: 'POST',
        body: formData
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Upload failed')
      }
      
      const data = await res.json()
      return { url: data.url, path: data.path }
    } catch (error) {
      toast({ title: 'Upload Error', description: error instanceof Error ? error.message : 'Failed to upload logo', variant: 'destructive' })
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast({ title: 'Error', description: 'Seller name is required', variant: 'destructive' })
      return
    }

    setIsLoading(true)
    let logo_url = ''
    let logo_storage_path = ''
    
    if (selectedFile) {
      const upload = await uploadLogo(selectedFile)
      if (upload) {
        logo_url = upload.url
        logo_storage_path = upload.path
      }
    }

    try {
      const res = await fetch('/api/developers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: formData.name,
          website: formData.website || undefined,
          address: formData.address || undefined,
          logo_url: logo_url || undefined,
          logo_storage_path: logo_storage_path || undefined,
          contact_info: formData.contact_info
        })
      })
      setIsLoading(false)
      if (!res.ok) {
        const data = await res.json()
        toast({ title: 'Error', description: data.error || 'Failed to add seller', variant: 'destructive' })
        return
      }
      toast({ title: 'Seller added successfully', variant: 'default' })
      onDeveloperAdded()
      onOpenChange(false)
      // Reset form
      setFormData({
        name: '',
        website: '',
        address: '',
        logo_url: '',
        logo_storage_path: '',
        contact_info: {
          phone: '',
          email: '',
          office_hours: ''
        }
      })
      removeSelectedFile()
    } catch {
      setIsLoading(false)
      toast({ title: 'Error', description: 'Network or server error', variant: 'destructive' })
      return
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Add New Seller</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <DeveloperFormFields
              formData={formData}
              onFormDataChange={setFormData}
              isLoading={isLoading}
              isUploading={isUploading}
              onFileSelect={handleFileSelect}
              onRemoveFile={removeSelectedFile}
              previewUrl={previewUrl}
            />
            
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                disabled={isLoading || isUploading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || isUploading || !formData.name.trim()}
              >
                {isLoading ? 'Adding...' : 'Add Seller'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 