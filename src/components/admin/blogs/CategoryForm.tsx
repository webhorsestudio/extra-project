'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Save, 
  X, 
  Hash,
  FileText,
  Sparkles,
  Eye
} from 'lucide-react'
import { useHydration } from '@/hooks/use-hydration'

interface Category {
  id?: string
  name: string
  description?: string
  slug: string
  created_at?: string
  updated_at?: string
}

interface CategoryFormProps {
  category?: Category
  onSuccess?: () => void
  onCancel?: () => void
}

export function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isHydrated = useHydration()
  const [formData, setFormData] = useState<Category>({
    name: category?.name || '',
    description: category?.description || '',
    slug: category?.slug || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate required fields
      if (!formData.name || !formData.slug) {
        throw new Error('Please fill in all required fields')
      }

      // Prepare category data
      const categoryData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
      }

      console.log('Saving category data:', categoryData)

      if (category?.id) {
        // For updates, use API route
        const response = await fetch(`/api/blog-categories/${category.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(categoryData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update category')
        }

        const data = await response.json()
        console.log('Update successful:', data)

        toast({
          title: 'Success',
          description: 'Category updated successfully',
        })
      } else {
        // For inserts, use API route
        console.log('Attempting to insert category via API...')
        const response = await fetch('/api/blog-categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(categoryData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('API error response:', errorData)
          throw new Error(errorData.error || 'Failed to create category')
        }

        const data = await response.json()
        console.log('Insert successful:', data)

        toast({
          title: 'Success',
          description: 'Category created successfully',
        })
      }

      // Call onSuccess callback if provided, otherwise redirect
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/admin/blogs/categories')
        router.refresh()
      }
    } catch (error) {
      console.error('Error saving category:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save category',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    setFormData(prev => ({ ...prev, slug }))
  }

  // Prevent hydration mismatch by not rendering until hydrated
  if (!isHydrated) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex justify-end gap-4">
          <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Category Name *
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter category name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>

        {/* Slug Field */}
        <div className="space-y-2">
          <Label htmlFor="slug" className="flex items-center gap-2">
            <Hash className="h-4 w-4" />
            URL Slug *
          </Label>
          <div className="flex gap-2">
            <Input
              id="slug"
              type="text"
              placeholder="category-slug"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              required
            />
            <Button
              type="button"
              variant="outline"
              onClick={generateSlug}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Generate
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            The URL-friendly version of the category name. Used in the category URL.
          </p>
        </div>

        {/* Description Field */}
        <div className="space-y-2">
          <Label htmlFor="description" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Description
          </Label>
          <Textarea
            id="description"
            placeholder="Enter category description (optional)"
            value={formData.description || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
          />
          <p className="text-sm text-muted-foreground">
            A brief description of what this category is about.
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel || (() => router.push('/admin/blogs/categories'))}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
          </Button>
        </div>
      </form>
    </div>
  )
}
