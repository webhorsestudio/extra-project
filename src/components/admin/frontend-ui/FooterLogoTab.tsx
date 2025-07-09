"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { Upload, Trash2, Image as ImageIcon, Loader2, Save } from 'lucide-react'

export default function FooterLogoTab() {
  const { toast } = useToast()
  const [logo, setLogo] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoSettings, setLogoSettings] = useState({
    showLogo: true,
    altText: 'Footer Logo',
    width: 180,
    height: 56,
    linkToHome: true
  })

  useEffect(() => {
    const fetchLogo = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/admin/footer/logo')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to fetch footer logo')
        setLogo(data.logo)
        
        if (data.logo) {
          const logoData = data.logo as Record<string, unknown>
          setLogoSettings({
            showLogo: logoData.show_logo !== false,
            altText: typeof logoData.logo_alt_text === 'string' ? logoData.logo_alt_text : 'Footer Logo',
            width: typeof logoData.logo_width === 'number' ? logoData.logo_width : 180,
            height: typeof logoData.logo_height === 'number' ? logoData.logo_height : 56,
            linkToHome: logoData.link_to_home !== false
          })
          
          if (typeof logoData.logo_url === 'string' && logoData.logo_url) {
            setLogoPreview(logoData.logo_url)
          }
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }
    fetchLogo()
    // Check admin (naive: if API returns logo, assume admin for now)
    fetch('/api/admin/footer/layout').then(r => r.json()).then(d => {
      setIsAdmin(!d.error)
    })
  }, [])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file (PNG, JPG, SVG)',
          variant: 'destructive'
        })
        return
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 2MB',
          variant: 'destructive'
        })
        return
      }

      setLogoFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (!logoFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a logo file to upload',
        variant: 'destructive'
      })
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', logoFile)

      const res = await fetch('/api/admin/footer/logo', {
        method: 'POST',
        body: formData,
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to upload logo')
      
      setLogo(data.logo)
      setLogoFile(null)
      toast({
        title: 'Success',
        description: 'Footer logo uploaded successfully',
      })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/footer/logo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(logo as Record<string, unknown>),
          show_logo: logoSettings.showLogo,
          logo_alt_text: logoSettings.altText,
          logo_width: logoSettings.width,
          logo_height: logoSettings.height,
          link_to_home: logoSettings.linkToHome
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save logo settings')
      setLogo(data.logo)
      toast({ title: 'Success', description: 'Logo settings saved.' })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveLogo = async () => {
    try {
      const res = await fetch('/api/admin/footer/logo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(logo as Record<string, unknown>),
          logo_url: null,
          logo_storage_path: null,
          logo_filename: null,
          logo_file_size: null,
          logo_mime_type: null
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to remove logo')
      
      setLogo(data.logo)
      setLogoFile(null)
      setLogoPreview(null)
      toast({
        title: 'Logo removed',
        description: 'Footer logo has been removed',
      })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }
  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>
  }

  return (
    <div className="space-y-6">
      {/* Logo Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Footer Logo</CardTitle>
          <CardDescription>
            Upload a dedicated logo for the footer. This logo will be displayed in white/light colors suitable for dark backgrounds.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Preview */}
          <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            {logoPreview ? (
              <div className="text-center">
                <img 
                  src={logoPreview} 
                  alt="Logo preview" 
                  className="max-w-[200px] max-h-[80px] object-contain mx-auto mb-4"
                />
                <p className="text-sm text-gray-600">Logo preview</p>
              </div>
            ) : (
              <div className="text-center">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">No logo uploaded</p>
                <p className="text-xs text-gray-500">Upload a logo for the footer</p>
              </div>
            )}
          </div>

          {/* File Upload */}
          {isAdmin && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="logo-upload">Select Logo File</Label>
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1"
                  disabled={uploading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: PNG, JPG, SVG (max 2MB)
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleUpload} 
                  disabled={!logoFile || uploading}
                  className="flex-1"
                >
                  {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading ? 'Uploading...' : 'Upload Logo'}
                </Button>
                {logoPreview && (
                  <Button 
                    variant="outline" 
                    onClick={handleRemoveLogo}
                    disabled={uploading}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logo Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Logo Settings</CardTitle>
          <CardDescription>
            Configure how the footer logo is displayed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Show/Hide Logo */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-logo">Show Footer Logo</Label>
              <p className="text-sm text-gray-500">Display the logo in the footer</p>
            </div>
            <Switch
              id="show-logo"
              checked={logoSettings.showLogo}
              onCheckedChange={(checked) => setLogoSettings({ ...logoSettings, showLogo: checked })}
              disabled={!isAdmin}
            />
          </div>

          {/* Alt Text */}
          <div className="space-y-2">
            <Label htmlFor="alt-text">Alt Text</Label>
            <Input
              id="alt-text"
              value={logoSettings.altText}
              onChange={(e) => setLogoSettings({ ...logoSettings, altText: e.target.value })}
              placeholder="Footer Logo"
              disabled={!isAdmin}
            />
            <p className="text-xs text-gray-500">Alternative text for accessibility</p>
          </div>

          {/* Logo Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="logo-width">Width (px)</Label>
              <Input
                id="logo-width"
                type="number"
                value={logoSettings.width}
                onChange={(e) => setLogoSettings({ ...logoSettings, width: parseInt(e.target.value) || 180 })}
                min="50"
                max="400"
                disabled={!isAdmin}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo-height">Height (px)</Label>
              <Input
                id="logo-height"
                type="number"
                value={logoSettings.height}
                onChange={(e) => setLogoSettings({ ...logoSettings, height: parseInt(e.target.value) || 56 })}
                min="20"
                max="200"
                disabled={!isAdmin}
              />
            </div>
          </div>

          {/* Link to Home */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="link-home">Link to Homepage</Label>
              <p className="text-sm text-gray-500">Make the logo clickable and link to homepage</p>
            </div>
            <Switch
              id="link-home"
              checked={logoSettings.linkToHome}
              onCheckedChange={(checked) => setLogoSettings({ ...logoSettings, linkToHome: checked })}
              disabled={!isAdmin}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      {isAdmin && (
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      )}

      {/* Logo Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Logo Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Use a white or light-colored logo for better visibility on dark backgrounds</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>SVG format is recommended for crisp display at all sizes</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Keep the file size under 2MB for optimal loading performance</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Recommended dimensions: 180x56 pixels or similar aspect ratio</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 