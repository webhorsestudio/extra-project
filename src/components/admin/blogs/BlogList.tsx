'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { BlogCard } from './BlogCard'
import { BlogSearchFilters } from './BlogSearchFilters'
import { BlogHeader } from './BlogHeader'

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

interface BlogListProps {
  initialBlogs: Blog[]
}

export function BlogList({ initialBlogs }: BlogListProps) {
  const router = useRouter()
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredBlogs = useMemo(() => {
    let filtered = blogs
    if (searchTerm) {
      filtered = filtered.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(blog => blog.status === statusFilter)
    }
    return filtered
  }, [blogs, searchTerm, statusFilter])

  const handleDelete = (deletedId: string) => {
    setBlogs(prev => prev.filter(blog => blog.id !== deletedId))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <BlogHeader />

      {/* Search and Filters */}
      <BlogSearchFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Blog Posts Grid */}
      {filteredBlogs.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No blog posts found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first blog post'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={() => router.push('/admin/blogs/new')}>
                Create First Post
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map(blog => (
            <BlogCard 
              key={blog.id} 
              blog={blog} 
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Results Summary */}
      {filteredBlogs.length > 0 && (
        <div className="text-sm text-muted-foreground text-center pt-4 border-t">
          Showing {filteredBlogs.length} of {blogs.length} blog posts
        </div>
      )}
    </div>
  )
}

export function BlogListSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Search Skeleton */}
      <Card className="shadow-none border bg-background">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-[180px]" />
          </div>
        </CardContent>
      </Card>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="rounded-xl border bg-background overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/6" />
              </div>
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 