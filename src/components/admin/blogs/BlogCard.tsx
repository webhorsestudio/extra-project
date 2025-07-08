'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Calendar, Tag, MoreHorizontal, Pencil, Trash, Eye, Image as ImageIcon } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Blog {
  id: string
  title: string
  slug: string
  excerpt: string
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
  featured_image?: string
  category: {
    name: string
  }
}

interface BlogCardProps {
  blog: Blog
  onDelete?: (id: string) => void
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getStatusColor(status: string) {
  switch (status) {
    case 'published':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'draft':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function BlogCard({ blog, onDelete }: BlogCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/blogs/${blog.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete blog post')
      }

      toast({
        title: 'Success',
        description: 'Blog post deleted successfully',
      })

      onDelete?.(blog.id)
    } catch (error) {
      console.error('Error deleting blog:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete blog post',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-200 rounded-xl border bg-background overflow-hidden">
        {/* Featured Image */}
        {blog.featured_image && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={blog.featured_image}
              alt={blog.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                {blog.title}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Calendar className="h-4 w-4" />
                {formatDate(blog.created_at)}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={isDeleting}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/admin/blogs/${blog.id}`)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)} 
                  className="text-red-600"
                  disabled={isDeleting}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Excerpt */}
            <p className="text-sm text-muted-foreground line-clamp-3">
              {blog.excerpt || 'No excerpt available'}
            </p>
            
            {/* Category and Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {blog.category?.name || 'Uncategorized'}
                </span>
              </div>
              <Badge variant="outline" className={`text-xs ${getStatusColor(blog.status)}`}>
                {blog.status}
              </Badge>
            </div>
            
            {/* Slug */}
            <div className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
              /{blog.slug}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{blog.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 