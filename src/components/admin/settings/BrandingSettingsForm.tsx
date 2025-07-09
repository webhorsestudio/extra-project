'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Upload, Image as ImageIcon, Monitor, Smartphone, X, CheckCircle, Globe, Eye } from 'lucide-react'
import { uploadFile } from '@/lib/uploadFile'

type Props = {
  settings: {
    logo_url?: string
    logo_storage_path?: string
    favicon_url?: string
    favicon_storage_path?: string
    logo_alt_text?: string
    favicon_alt_text?: string
  }
}

type ImagePreview = {
  file: File
  preview: string
}

export function BrandingSettingsForm({ settings }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [logoPreview, setLogoPreview] = useState<ImagePreview | null>(null)
  const [faviconPreview, setFaviconPreview] = useState<ImagePreview | null>(null)
  const [formData, setFormData] = useState({
    logo_alt_text: settings?.logo_alt_text || '',
    favicon_alt_text: settings?.favicon_alt_text || '',
  })
  const logoInputRef = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Logo file must be smaller than 2MB',
        variant: 'destructive',
      })
      return
    }

    setLogoPreview({
      file,
      preview: URL.createObjectURL(file)
    })
  }

  const handleFaviconSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 500KB)
    if (file.size > 500 * 1024) {
      toast({
        title: 'File too large',
        description: 'Favicon file must be smaller than 500KB',
        variant: 'destructive',
      })
      return
    }

    setFaviconPreview({
      file,
      preview: URL.createObjectURL(file)
    })
  }

  const removeLogo = () => {
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview.preview)
      setLogoPreview(null)
    }
    if (logoInputRef.current) {
      logoInputRef.current.value = ''
    }
  }

  const removeFavicon = () => {
    if (faviconPreview) {
      URL.revokeObjectURL(faviconPreview.preview)
      setFaviconPreview(null)
    }
    if (faviconInputRef.current) {
      faviconInputRef.current.value = ''
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const onSubmit = async () => {
    try {
      console.log('Starting branding settings update...')
      setIsLoading(true)

      let logoUrl = settings?.logo_url || ''
      let logoStoragePath = settings?.logo_storage_path || ''
      let faviconUrl = settings?.favicon_url || ''
      let faviconStoragePath = settings?.favicon_storage_path || ''

      // Upload logo if a new one is selected
      if (logoPreview) {
        try {
          console.log('Uploading logo...')
          const logoResult = await uploadFile(logoPreview.file, 'branding', 'logos')
          logoUrl = logoResult.publicUrl
          logoStoragePath = logoResult.storagePath
          console.log('Logo uploaded successfully:', logoResult)
        } catch (error) {
          console.error('Error uploading logo:', error)
          toast({
            title: 'Error',
            description: 'Failed to upload logo. Please try again.',
            variant: 'destructive',
          })
          setIsLoading(false)
          return
        }
      }

      // Upload favicon if a new one is selected
      if (faviconPreview) {
        try {
          console.log('Uploading favicon...')
          const faviconResult = await uploadFile(faviconPreview.file, 'branding', 'favicons')
          faviconUrl = faviconResult.publicUrl
          faviconStoragePath = faviconResult.storagePath
          console.log('Favicon uploaded successfully:', faviconResult)
        } catch (error) {
          console.error('Error uploading favicon:', error)
          toast({
            title: 'Error',
            description: 'Failed to upload favicon. Please try again.',
            variant: 'destructive',
          })
          setIsLoading(false)
          return
        }
      }

      // Prepare the update data
      const updateData = {
        logo_url: logoUrl,
        logo_storage_path: logoStoragePath,
        favicon_url: faviconUrl,
        favicon_storage_path: faviconStoragePath,
        logo_alt_text: formData.logo_alt_text,
        favicon_alt_text: formData.favicon_alt_text,
      }

      console.log('Attempting to update settings with:', updateData)

      // Use API route to update settings
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update settings')
      }

      console.log('Settings updated successfully')

      // Clear previews after successful update
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview.preview)
        setLogoPreview(null)
        if (logoInputRef.current) {
          logoInputRef.current.value = ''
        }
      }

      if (faviconPreview) {
        URL.revokeObjectURL(faviconPreview.preview)
        setFaviconPreview(null)
        if (faviconInputRef.current) {
          faviconInputRef.current.value = ''
        }
      }

      toast({
        title: 'Success',
        description: 'Branding settings updated successfully',
      })
    } catch (error) {
      console.error('Error updating branding settings:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update branding settings',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const currentLogoUrl = logoPreview?.preview || settings?.logo_url || ''
  const currentFaviconUrl = faviconPreview?.preview || settings?.favicon_url || ''

  return (
    <div className="space-y-8">
      {/* Logo Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Logo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Logo Preview */}
            <div className="flex-shrink-0">
              <Label className="text-sm font-medium mb-3 block">Logo Preview</Label>
              <div className="space-y-4">
                {/* Desktop Preview */}
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-center gap-2 mb-2">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Desktop Header</span>
                  </div>
                  <div className="h-12 flex items-center justify-start">
                    {currentLogoUrl ? (
                      <img
                        src={currentLogoUrl}
                        alt="Logo preview"
                        className="max-h-8 max-w-32 object-contain"
                      />
                    ) : (
                      <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">No logo</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Mobile Preview */}
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-center gap-2 mb-2">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Mobile Header</span>
                  </div>
                  <div className="h-10 flex items-center justify-start">
                    {currentLogoUrl ? (
                      <img
                        src={currentLogoUrl}
                        alt="Logo preview"
                        className="max-h-6 max-w-24 object-contain"
                      />
                    ) : (
                      <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">No logo</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Logo Upload */}
            <div className="flex-1 space-y-4">
              <div>
                <Label className="text-sm font-medium">Upload Logo</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Recommended: PNG or SVG, max 2MB. Optimal size: 200x50px
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoSelect}
                  ref={logoInputRef}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => logoInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {currentLogoUrl ? 'Change Logo' : 'Upload Logo'}
                </Button>
                {currentLogoUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={removeLogo}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div>
                <Label htmlFor="logo_alt_text">Logo Alt Text</Label>
                <Input
                  id="logo_alt_text"
                  name="logo_alt_text"
                  value={formData.logo_alt_text}
                  onChange={handleInputChange}
                  placeholder="Alternative text for accessibility"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Describe your logo for screen readers and accessibility
                </p>
              </div>

              {currentLogoUrl && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Logo uploaded successfully
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Favicon Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Favicon
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Favicon Preview */}
            <div className="flex-shrink-0">
              <Label className="text-sm font-medium mb-3 block">Favicon Preview</Label>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Browser Tab</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentFaviconUrl ? (
                      <img
                        src={currentFaviconUrl}
                        alt="Favicon preview"
                        className="w-6 h-6 object-contain"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
                    )}
                    <span className="text-sm">Your Website</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Favicon Upload */}
            <div className="flex-1 space-y-4">
              <div>
                <Label className="text-sm font-medium">Upload Favicon</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Recommended: ICO, PNG, or SVG, max 500KB. Size: 32x32px
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFaviconSelect}
                  ref={faviconInputRef}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => faviconInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {currentFaviconUrl ? 'Change Favicon' : 'Upload Favicon'}
                </Button>
                {currentFaviconUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={removeFavicon}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div>
                <Label htmlFor="favicon_alt_text">Favicon Alt Text</Label>
                <Input
                  id="favicon_alt_text"
                  name="favicon_alt_text"
                  value={formData.favicon_alt_text}
                  onChange={handleInputChange}
                  placeholder="Alternative text for accessibility"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Describe your favicon for screen readers and accessibility
                </p>
              </div>

              {currentFaviconUrl && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Favicon uploaded successfully
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Brand Guidelines Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Brand Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Logo Guidelines</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use PNG or SVG format for best quality</li>
                <li>• Keep file size under 2MB</li>
                <li>• Optimal dimensions: 200x50px</li>
                <li>• Ensure good contrast with backgrounds</li>
                <li>• Test on both light and dark themes</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Favicon Guidelines</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use ICO, PNG, or SVG format</li>
                <li>• Keep file size under 500KB</li>
                <li>• Optimal size: 32x32px</li>
                <li>• Should be recognizable at small sizes</li>
                <li>• Works well in browser tabs</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={onSubmit} disabled={isLoading} size="lg">
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
} 