'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  AlertCircle, 
  Save, 
  X, 
  FileText,
  Hash,
  Calendar,
  Eye,
  Edit3,
  Sparkles,
  ArrowLeft,
  Plus
} from 'lucide-react'
import { TiptapEditor } from './TiptapEditor'

interface Page {
  id?: string
  title: string
  slug: string
  content: any
  status: 'draft' | 'published'
  created_at?: string
  updated_at?: string
}

interface PageFormProps {
  page?: Page
}

export default function PageForm({ page }: PageFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Page>({
    title: page?.title || '',
    slug: page?.slug || '',
    content: page?.content || {},
    status: page?.status || 'draft',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate required fields
      if (!formData.title || !formData.slug) {
        throw new Error('Please fill in all required fields')
      }

      const pageData = {
        ...formData,
        updated_at: new Date().toISOString(),
      }

      console.log('Saving page data:', pageData)

      if (page?.id) {
        // Update existing page
        const response = await fetch(`/api/admin/pages/${page.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(pageData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update page')
        }

        const data = await response.json()
        console.log('Update successful:', data)

        toast({
          title: 'Success',
          description: 'Page updated successfully',
        })
      } else {
        // Create new page
        const response = await fetch('/api/admin/pages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...pageData, created_at: new Date().toISOString() }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create page')
        }

        const data = await response.json()
        console.log('Insert successful:', data)

        toast({
          title: 'Success',
          description: 'Page created successfully',
        })
      }

      // Use window.location for stable navigation
      window.location.href = '/admin/pages'
    } catch (error) {
      console.error('Error saving page:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save page',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    setFormData(prev => ({ ...prev, slug }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {page ? 'Edit Page' : 'Create New Page'}
          </h1>
          <p className="text-muted-foreground">
            {page ? 'Update your page content and settings' : 'Create a new page for your website'}
          </p>
        </div>
        {page && (
          <Badge variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Created: {page.created_at ? new Date(page.created_at).toLocaleDateString() : 'Unknown'}
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
                <CardTitle className="text-xl font-semibold">Page Information</CardTitle>
                <CardDescription>Set the title, slug, and status for your page</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Page Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter your page title..."
                  required
                />
                <p className="text-xs text-gray-500">
                  The main title that will appear on your page
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
                    placeholder="page-url"
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
                  URL-friendly version of your page title
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'draft' | 'published') => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      Draft
                    </div>
                  </SelectItem>
                  <SelectItem value="published">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Published
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Choose whether to save as draft or publish immediately
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
                <CardTitle className="text-xl font-semibold">Page Content</CardTitle>
                <CardDescription>Write your page content using the rich text editor</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Content
              </Label>
              <div className="border rounded-lg">
                <TiptapEditor
                  content={formData.content}
                  onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                />
              </div>
              <p className="text-xs text-gray-500">
                Write your main page content using the rich text editor
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Preview Card */}
        <Card className="bg-gray-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold">Preview</CardTitle>
                <CardDescription>How your page will appear</CardDescription>
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
                    {formData.title || 'Page Title'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 font-mono">
                    /{formData.slug || 'page-slug'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {formData.status || 'draft'}
                    </Badge>
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
            onClick={() => router.push('/admin/pages')}
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
                {page ? 'Update Page' : 'Create Page'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
} 