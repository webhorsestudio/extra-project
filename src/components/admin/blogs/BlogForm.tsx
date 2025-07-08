'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Save, 
  X, 
  Upload, 
  Image as ImageIcon,
  FileText,
  Tag,
  Calendar,
  CheckCircle,
  ArrowLeft
} from 'lucide-react'
import { RichEditor } from './RichEditor'

interface Blog {
  id?: string
  title: string
  slug: string
  content: any
  excerpt: string
  category_id: string
  status: 'draft' | 'published'
  featured_image?: string
  created_at?: string
  updated_at?: string
}

interface Category {
  id: string
  name: string
}

interface BlogFormProps {
  blog?: Blog
  categories: Category[]
}

export function BlogForm({ blog, categories }: BlogFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState<Blog>({
    title: blog?.title || '',
    slug: blog?.slug || '',
    content: blog?.content || {},
    excerpt: blog?.excerpt || '',
    category_id: blog?.category_id || '',
    status: blog?.status || 'draft',
    featured_image: blog?.featured_image || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate required fields
      const requiredFields = ['title', 'slug', 'category_id']
      const missingFields = requiredFields.filter(field => !formData[field as keyof Blog])
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in the following required fields: ${missingFields.join(', ')}`)
      }

      const blogData = {
        ...formData,
        updated_at: new Date().toISOString(),
      }

      if (blog?.id) {
        const { error } = await supabase
          .from('blogs')
          .update(blogData)
          .eq('id', blog.id)

        if (error) throw new Error(error.message || 'Failed to update blog post')

        toast({
          title: 'Success',
          description: 'Blog post updated successfully',
        })
      } else {
        const { error } = await supabase
          .from('blogs')
          .insert([{ ...blogData, created_at: new Date().toISOString() }])

        if (error) throw new Error(error.message || 'Failed to create blog post')

        toast({
          title: 'Success',
          description: 'Blog post created successfully',
        })
      }

      router.push('/admin/blogs')
    } catch (error) {
      console.error('Error saving blog:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save blog post',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)

      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file')
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size should be less than 5MB')
      }

      // Convert image to base64
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64String = event.target?.result as string
        setFormData(prev => ({ ...prev, featured_image: base64String }))
        
        toast({
          title: 'Success',
          description: 'Image uploaded successfully',
        })
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload image',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = () => {
    setFormData(prev => ({ ...prev, featured_image: '' }))
  }

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    setFormData(prev => ({ ...prev, slug }))
  }

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {blog ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {blog ? 'Update your blog post content and settings' : 'Write and publish your new blog post'}
          </p>
        </div>
        {blog && (
          <Badge variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Created: {blog.created_at ? new Date(blog.created_at).toLocaleDateString() : 'Unknown'}
          </Badge>
        )}
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter your blog post title..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="blog-post-url"
                    className="font-mono"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateSlug}
                    className="whitespace-nowrap"
                  >
                    Generate
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'draft' | 'published') => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Featured Image */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Featured Image</CardTitle>
          </CardHeader>
          <CardContent>
            {formData.featured_image ? (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={formData.featured_image}
                    alt="Featured"
                    className="w-full max-w-md h-48 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeImage}
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Image uploaded successfully
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  id="featured_image"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <label
                  htmlFor="featured_image"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <div className="p-3 bg-gray-100 rounded-full">
                    <Upload className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {isUploading ? 'Uploading...' : 'Click to upload featured image'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                </label>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Write a brief excerpt for your blog post..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Content</Label>
              <RichEditor
                content={formData.content}
                onChange={(content) => setFormData(prev => ({ ...prev, content }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/blogs')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blogs
          </Button>
          <Button type="submit" disabled={isSubmitting} className="px-8">
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : (blog ? 'Update Post' : 'Create Post')}
          </Button>
        </div>
      </form>
    </div>
  )
} 