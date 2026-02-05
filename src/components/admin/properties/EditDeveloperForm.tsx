'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DeveloperFormFields } from './forms/DeveloperFormFields'
import { DeveloperFormData } from '@/types/developer'
import { PropertyDeveloper } from '@/types/property'

interface EditDeveloperFormProps {
  developer: PropertyDeveloper
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeveloperUpdated: () => void
}

export function EditDeveloperForm({ developer, open, onOpenChange, onDeveloperUpdated }: EditDeveloperFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState<DeveloperFormData>({
    name: developer.name || '',
    website: developer.website || '',
    address: developer.address || '',
    logo_url: developer.logo_url || '',
    logo_storage_path: developer.logo_storage_path || '',
    contact_info: {
      phone: developer.contact_info?.phone || '',
      email: developer.contact_info?.email || '',
      office_hours: developer.contact_info?.office_hours || ''
    }
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(developer.logo_url || null)
  const { toast } = useToast()

  useEffect(() => {
    setFormData({
      name: developer.name || '',
      website: developer.website || '',
      address: developer.address || '',
      logo_url: developer.logo_url || '',
      logo_storage_path: developer.logo_storage_path || '',
      contact_info: {
        phone: developer.contact_info?.phone || '',
        email: developer.contact_info?.email || '',
        office_hours: developer.contact_info?.office_hours || ''
      }
    })
    setPreviewUrl(developer.logo_url || null)
    setSelectedFile(null)
  }, [developer])

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
    if (previewUrl && previewUrl !== developer.logo_url) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(developer.logo_url || null)
    
    // Reset formData to original logo values
    setFormData(prev => ({
      ...prev,
      logo_url: developer.logo_url || '',
      logo_storage_path: developer.logo_storage_path || ''
    }))
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
    } catch (_error) {
      toast({ title: 'Upload Error', description: _error instanceof Error ? _error.message : 'Failed to upload logo', variant: 'destructive' })
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
    let logo_url = formData.logo_url
    let logo_storage_path = formData.logo_storage_path
    
    // If a new file is selected, upload it and get new URL/path
    if (selectedFile) {
      const upload = await uploadLogo(selectedFile)
      if (upload) {
        logo_url = upload.url
        logo_storage_path = upload.path
        
        // Update formData with new logo information
        setFormData(prev => ({
          ...prev,
          logo_url: upload.url,
          logo_storage_path: upload.path
        }))
      }
    }
    
    try {
      const res = await fetch(`/api/developers/${developer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          website: formData.website || undefined,
          address: formData.address || undefined,
          logo_url: logo_url || undefined,
          logo_storage_path: logo_storage_path || undefined,
          contact_info: formData.contact_info,
          is_active: developer.is_active
        })
      })
      setIsLoading(false)
      if (!res.ok) {
        const data = await res.json()
        toast({ title: 'Error', description: data.error || 'Failed to update seller', variant: 'destructive' })
        return
      }
      
      // If a new logo was uploaded and there was an old logo, delete the old one from storage
      if (selectedFile && developer.logo_storage_path && developer.logo_storage_path !== logo_storage_path) {
        try {
          await supabase.storage
            .from('developer-logos')
            .remove([developer.logo_storage_path])
        } catch (storageError) {
          console.error('Error deleting old logo from storage:', storageError)
          // Don't fail the request if old logo deletion fails
        }
      }
      
      toast({ title: 'Seller updated successfully', variant: 'default' })
      onDeveloperUpdated()
      onOpenChange(false)
      setSelectedFile(null)
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
          <CardTitle>Edit Seller</CardTitle>
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
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 