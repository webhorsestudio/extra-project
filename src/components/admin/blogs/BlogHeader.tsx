'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface BlogHeaderProps {
  title?: string
  description?: string
}

export function BlogHeader({ 
  title = "Blog Posts", 
  description = "Manage your blog posts and content" 
}: BlogHeaderProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-semibold mb-1">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <Button 
        onClick={() => router.push('/admin/blogs/new')} 
        className="flex items-center gap-2 px-6 py-2"
      >
        <Plus className="h-4 w-4" />
        New Post
      </Button>
    </div>
  )
} 