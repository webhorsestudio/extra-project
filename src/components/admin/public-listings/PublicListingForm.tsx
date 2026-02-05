'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  FileText,
  Hash,
  Calendar,
  Sparkles,
  Edit3,
  Eye,
  X,
  Save,
  Image as ImageIcon,
  Settings,
  Clock
} from 'lucide-react'
import { TiptapEditor } from '@/components/admin/pages/TiptapEditor'
import { 
  PublicListing, 
  PublicListingType,
  PublicListingStatus,
  CreatePublicListingData, 
  UpdatePublicListingData,
  PUBLIC_LISTING_TYPES,
  PUBLIC_LISTING_STATUSES
} from '@/types/public-listing'

interface PublicListingFormProps {
  listing?: PublicListing
}

export default function PublicListingForm({ listing }: PublicListingFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<CreatePublicListingData | UpdatePublicListingData>({
    title: listing?.title || '',
    slug: listing?.slug || '',
    type: listing?.type || 'public_property',
    content: (listing?.content && typeof listing.content === 'object' && !Array.isArray(listing.content)) 
      ? listing.content as Record<string, unknown> 
      : {},
    excerpt: listing?.excerpt || '',
    featured_image_url: listing?.featured_image_url || '',
    status: listing?.status || 'draft',
    order_index: listing?.order_index || 0,
    metadata: (listing?.metadata && typeof listing.metadata === 'object' && !Array.isArray(listing.metadata)) 
      ? listing.metadata as Record<string, unknown> 
      : {},
    publish_date: listing?.publish_date ? listing.publish_date.split('T')[0] : '',
    expire_date: listing?.expire_date ? listing.expire_date.split('T')[0] : '',
  })

  // Ensure content is always a valid object
  const contentValue = formData.content || {}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate required fields
      if (!formData.title || !formData.slug || !formData.type) {
        throw new Error('Please fill in all required fields')
      }

      const submitData = {
        ...formData,
        publish_date: formData.publish_date ? new Date(formData.publish_date).toISOString() : undefined,
        expire_date: formData.expire_date ? new Date(formData.expire_date).toISOString() : undefined,
      }

      console.log('Saving listing data:', submitData)

      if (listing?.id) {
        // Update existing listing
        const response = await fetch(`/api/admin/public-listings/${listing.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update listing')
        }

        const data = await response.json()
        console.log('Update successful:', data)

        toast({
          title: 'Success',
          description: 'Public listing updated successfully',
        })
      } else {
        // Create new listing
        const response = await fetch('/api/admin/public-listings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create listing')
        }

        const data = await response.json()
        console.log('Insert successful:', data)

        toast({
          title: 'Success',
          description: 'Public listing created successfully',
        })
      }

      // Navigate back to the listings page
      router.push('/admin/frontend-ui/public-listings')
    } catch (error) {
      console.error('Error saving listing:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save listing',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateSlug = () => {
    if (!formData.title) return
    
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    setFormData(prev => ({ ...prev, slug }))
  }

  const selectedType = PUBLIC_LISTING_TYPES.find(t => t.value === formData.type)
  const selectedStatus = PUBLIC_LISTING_STATUSES.find(s => s.value === formData.status)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {listing ? 'Edit Public Listing' : 'Create New Public Listing'}
          </h1>
          <p className="text-muted-foreground">
            {listing ? 'Update your public listing content and settings' : 'Create a new public listing for your website'}
          </p>
        </div>
        {listing && (
          <Badge variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Created: {listing.created_at ? new Date(listing.created_at).toLocaleDateString() : 'Unknown'}
          </Badge>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold">Basic Information</CardTitle>
                <CardDescription>Set the title, slug, type, and basic details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter listing title..."
                  required
                />
                <p className="text-xs text-gray-500">
                  The main title for your public listing
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-sm font-medium">
                  Slug <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="listing-url"
                    className="font-mono"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateSlug}
                    className="whitespace-nowrap"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  URL-friendly version of your listing title
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-medium">
                  Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as PublicListingType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PUBLIC_LISTING_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="space-y-1">
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as PublicListingStatus }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PUBLIC_LISTING_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            status.value === 'published' ? 'bg-green-500' :
                            status.value === 'draft' ? 'bg-yellow-500' :
                            'bg-gray-500'
                          }`} />
                          {status.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt" className="text-sm font-medium">
                Excerpt
              </Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Brief description or summary..."
                rows={3}
              />
              <p className="text-xs text-gray-500">
                Short description that appears in listing previews
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Content Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Edit3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold">Content</CardTitle>
                <CardDescription>Write your listing content using the rich text editor</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Main Content
              </Label>
              <div className="border rounded-lg">
                <TiptapEditor
                  content={contentValue}
                  onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                />
              </div>
              <p className="text-xs text-gray-500">
                Write your main listing content using the rich text editor
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Media & Settings Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Settings className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold">Media & Settings</CardTitle>
                <CardDescription>Configure additional settings and media</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="featured_image_url" className="text-sm font-medium">
                Featured Image URL
              </Label>
              <div className="flex gap-2">
                <Input
                  id="featured_image_url"
                  value={formData.featured_image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured_image_url: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                  type="url"
                />
                <Button type="button" variant="outline" size="icon">
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                URL of the main image for this listing
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="order_index" className="text-sm font-medium">
                  Order Index
                </Label>
                <Input
                  id="order_index"
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  min="0"
                />
                <p className="text-xs text-gray-500">
                  Display order (lower numbers appear first)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="publish_date" className="text-sm font-medium">
                  Publish Date
                </Label>
                <Input
                  id="publish_date"
                  type="date"
                  value={formData.publish_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, publish_date: e.target.value }))}
                />
                <p className="text-xs text-gray-500">
                  When to publish this listing
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expire_date" className="text-sm font-medium">
                  Expire Date
                </Label>
                <Input
                  id="expire_date"
                  type="date"
                  value={formData.expire_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, expire_date: e.target.value }))}
                />
                <p className="text-xs text-gray-500">
                  When this listing expires
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview Card */}
        <Card className="bg-gray-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Eye className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold">Preview</CardTitle>
                <CardDescription>How your listing will appear</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Hash className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {formData.title || 'Listing Title'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 font-mono">
                    /{formData.slug || 'listing-slug'}
                  </p>
                  {formData.excerpt && (
                    <p className="text-sm text-gray-600 mt-1">
                      {formData.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {selectedType?.label}
                    </Badge>
                    <Badge className={selectedStatus?.color + ' text-xs'}>
                      {selectedStatus?.label}
                    </Badge>
                    {(formData.publish_date || formData.expire_date) && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Scheduled
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/frontend-ui/public-listings')}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {listing ? 'Update Listing' : 'Create Listing'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
