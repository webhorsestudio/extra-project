'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, ArrowRight } from 'lucide-react'
import { useState } from 'react'

interface BlogCardProps {
  blog: {
    id: string;
    title: string;
    excerpt: string;
    featured_image: string | null;
    created_at?: string;
  }
}

export default function BlogCard({ blog }: BlogCardProps) {
  const [imageError, setImageError] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <Link href={`/web/blogs/${blog.id}`} className="group">
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-[420px] flex flex-col bg-white border-gray-200 hover:border-blue-200">
        <CardHeader className="p-0 relative">
          <div className="relative h-36 sm:h-40 w-full overflow-hidden">
            <Image
              src={imageError || !blog.featured_image ? '/placeholder.svg' : blog.featured_image}
              alt={`Featured image for ${blog.title}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={handleImageError}
              priority={false}
            />
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Date badge */}
            {blog.created_at && (
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="bg-white/90 text-gray-700 text-xs font-medium">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(blog.created_at)}
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-4 sm:p-5 flex-grow flex flex-col">
          {/* Title */}
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
            {blog.title}
          </h3>
          
          {/* Excerpt */}
          <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2 flex-grow">
            {blog.excerpt}
          </p>
          
          {/* Read more link */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
            <span className="text-blue-600 text-sm font-medium group-hover:text-blue-700 transition-colors duration-200">
              Read More
            </span>
            <ArrowRight className="h-4 w-4 text-blue-600 group-hover:translate-x-1 transition-transform duration-200" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
} 