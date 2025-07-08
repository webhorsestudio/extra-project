'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Upload, Save, Download, AlertCircle, FileText, Image as ImageIcon, ExternalLink, CheckCircle, Link, Facebook, Twitter, Instagram, Linkedin, Youtube, Music } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { supabase } from '@/lib/supabaseClient'

type Props = {
  settings: {
    site_title: string
    meta_description: string
    default_og_image_url: string
    default_og_image_storage_path?: string
    website_url: string
    facebook_url: string
    twitter_url: string
    instagram_url: string
    linkedin_url: string
    youtube_url: string
    tiktok_url: string
    whatsapp_url: string
  }
}

export function WebsiteSettingsForm({ settings }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    site_title: settings.site_title || '',
    meta_description: settings.meta_description || '',
    default_og_image_url: settings.default_og_image_url || '',
    default_og_image_storage_path: settings.default_og_image_storage_path || '',
    website_url: settings.website_url || '',
    facebook_url: settings.facebook_url || '',
    twitter_url: settings.twitter_url || '',
    instagram_url: settings.instagram_url || '',
    linkedin_url: settings.linkedin_url || '',
    youtube_url: settings.youtube_url || '',
    tiktok_url: settings.tiktok_url || '',
    whatsapp_url: settings.whatsapp_url || '',
  })
  const { toast } = useToast()

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file (JPEG, PNG, GIF, etc.)',
        variant: 'destructive',
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsUploading(true)

      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        console.error('Authentication error:', authError)
        toast({
          title: 'Authentication Error',
          description: 'Please log in to upload images',
          variant: 'destructive',
        })
        return
      }

      console.log('User authenticated:', user.id)

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `og-image-${Date.now()}.${fileExt}`

      console.log('Attempting to upload file:', fileName)

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('settings')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload error details:', {
          message: error.message,
        })
        
        // Provide more specific error messages
        let errorMessage = 'Failed to upload image. Please try again.'
        if (error.message.includes('not found')) {
          errorMessage = 'Storage bucket not found. Please contact administrator.'
        } else if (error.message.includes('unauthorized')) {
          errorMessage = 'You are not authorized to upload files. Please log in again.'
        } else if (error.message.includes('policy')) {
          errorMessage = 'Upload policy error. Please contact administrator.'
        }
        
        toast({
          title: 'Upload Error',
          description: errorMessage,
          variant: 'destructive',
        })
        return
      }

      console.log('Upload successful:', data)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('settings')
        .getPublicUrl(fileName)

      console.log('Public URL:', urlData.publicUrl)

      // Update form data
      setFormData(prev => ({
        ...prev,
        default_og_image_storage_path: fileName,
        default_og_image_url: urlData.publicUrl
      }))

      toast({
        title: 'Success',
        description: 'OG image uploaded successfully',
      })
    } catch (error) {
      console.error('Error uploading file:', error)
      toast({
        title: 'Error',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const removeUploadedImage = () => {
    setFormData(prev => ({
      ...prev,
      default_og_image_storage_path: '',
      default_og_image_url: ''
    }))
  }

  const onSubmit = async () => {
    try {
      setIsLoading(true)

      // Validate website URL if provided
      if (formData.website_url && !isValidUrl(formData.website_url)) {
        throw new Error('Please enter a valid website URL (e.g., https://example.com)')
      }

      // Use API route to update settings
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          site_title: formData.site_title,
          meta_description: formData.meta_description,
          default_og_image_url: formData.default_og_image_url,
          default_og_image_storage_path: formData.default_og_image_storage_path,
          website_url: formData.website_url,
          facebook_url: formData.facebook_url,
          twitter_url: formData.twitter_url,
          instagram_url: formData.instagram_url,
          linkedin_url: formData.linkedin_url,
          youtube_url: formData.youtube_url,
          tiktok_url: formData.tiktok_url,
          whatsapp_url: formData.whatsapp_url,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update settings')
      }

      toast({
        title: 'Success',
        description: 'Website settings updated successfully',
      })
    } catch (error) {
      console.error('Error updating website settings:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update website settings',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // URL validation helper function
  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  return (
    <div className="space-y-8">
      {/* Basic Information Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ImageIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Basic Information
              </CardTitle>
              <CardDescription className="text-gray-600">
                Configure your website's core identity and metadata
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="site_title" className="text-sm font-medium text-gray-700">
                Site Title
              </Label>
              <Input
                id="site_title"
                name="site_title"
                value={formData.site_title}
                onChange={handleChange}
                placeholder="Your Amazing Website"
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500">
                The title that appears in browser tabs and search results
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website_url" className="text-sm font-medium text-gray-700">
                Website URL
              </Label>
              <Input
                id="website_url"
                name="website_url"
                type="url"
                value={formData.website_url}
                onChange={handleChange}
                placeholder="https://example.com"
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500">
                Your main domain URL for canonical links and social sharing
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta_description" className="text-sm font-medium text-gray-700">
              Meta Description
            </Label>
            <Textarea
              id="meta_description"
              name="meta_description"
              value={formData.meta_description}
              onChange={handleChange}
              placeholder="A compelling description of your website that appears in search results..."
              rows={3}
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">
                Keep between 150-160 characters for optimal SEO
              </p>
              <Badge variant="secondary" className="text-xs">
                {formData.meta_description.length}/160
              </Badge>
            </div>
          </div>

          {/* Default OG Image Section */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Default OG Image
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                Default image shown when your site is shared on social media (1200x630px recommended)
              </p>
            </div>

            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Image
                </TabsTrigger>
                <TabsTrigger value="url" className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Image URL
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    id="og-image-upload"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="og-image-upload"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Upload className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {isUploading ? 'Uploading...' : 'Click to upload image'}
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  </label>
                </div>

                {formData.default_og_image_storage_path && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">Image uploaded successfully</p>
                        <p className="text-xs text-green-600">{formData.default_og_image_storage_path}</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={removeUploadedImage}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                    {formData.default_og_image_url && (
                      <div className="relative">
                        <img
                          src={formData.default_og_image_url}
                          alt="OG Image Preview"
                          className="w-full max-w-md h-auto rounded-lg border"
                        />
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="url" className="space-y-4">
                <div className="space-y-2">
                  <Input
                    name="default_og_image_url"
                    value={formData.default_og_image_url}
                    onChange={handleChange}
                    placeholder="https://example.com/og-image.jpg"
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500">
                    Enter the full URL of your OG image
                  </p>
                </div>

                {formData.default_og_image_url && !formData.default_og_image_storage_path && (
                  <div className="relative">
                    <img
                      src={formData.default_og_image_url}
                      alt="OG Image Preview"
                      className="w-full max-w-md h-auto rounded-lg border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Social Media Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Link className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Social Media Profiles
              </CardTitle>
              <CardDescription className="text-gray-600">
                Connect your social media accounts to display them on your website
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="facebook_url" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Facebook className="h-4 w-4 text-blue-600" />
                Facebook URL
              </Label>
              <Input
                id="facebook_url"
                name="facebook_url"
                type="url"
                value={formData.facebook_url}
                onChange={handleChange}
                placeholder="https://facebook.com/yourpage"
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter_url" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Twitter className="h-4 w-4 text-sky-500" />
                Twitter URL
              </Label>
              <Input
                id="twitter_url"
                name="twitter_url"
                type="url"
                value={formData.twitter_url}
                onChange={handleChange}
                placeholder="https://twitter.com/yourhandle"
                className="border-gray-200 focus:border-sky-500 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram_url" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Instagram className="h-4 w-4 text-pink-600" />
                Instagram URL
              </Label>
              <Input
                id="instagram_url"
                name="instagram_url"
                type="url"
                value={formData.instagram_url}
                onChange={handleChange}
                placeholder="https://instagram.com/yourprofile"
                className="border-gray-200 focus:border-pink-500 focus:ring-pink-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin_url" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Linkedin className="h-4 w-4 text-blue-700" />
                LinkedIn URL
              </Label>
              <Input
                id="linkedin_url"
                name="linkedin_url"
                type="url"
                value={formData.linkedin_url}
                onChange={handleChange}
                placeholder="https://linkedin.com/company/yourcompany"
                className="border-gray-200 focus:border-blue-700 focus:ring-blue-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube_url" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Youtube className="h-4 w-4 text-red-600" />
                YouTube URL
              </Label>
              <Input
                id="youtube_url"
                name="youtube_url"
                type="url"
                value={formData.youtube_url}
                onChange={handleChange}
                placeholder="https://youtube.com/@yourchannel"
                className="border-gray-200 focus:border-red-500 focus:ring-red-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tiktok_url" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Music className="h-4 w-4 text-black" />
                TikTok URL
              </Label>
              <Input
                id="tiktok_url"
                name="tiktok_url"
                type="url"
                value={formData.tiktok_url}
                onChange={handleChange}
                placeholder="https://tiktok.com/@yourusername"
                className="border-gray-200 focus:border-black focus:ring-black"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp_url" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FaWhatsapp className="h-4 w-4 text-green-600" />
                WhatsApp URL
              </Label>
              <Input
                id="whatsapp_url"
                name="whatsapp_url"
                type="url"
                value={formData.whatsapp_url}
                onChange={handleChange}
                placeholder="https://wa.me/yourphonenumber"
                className="border-gray-200 focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={onSubmit} 
          disabled={isLoading}
          className="bg-black hover:bg-gray-800 text-white px-8 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  )
} 