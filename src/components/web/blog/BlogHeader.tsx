import Image from 'next/image'
import { Calendar } from 'lucide-react'

interface Category {
  id: string;
  name: string;
}

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  featured_image: string | null;
  created_at?: string;
  categories?: Category[];
}

export default function BlogHeader({ blog }: { blog: Blog }) {
  return (
    <header className="relative">
      {blog.featured_image && (
        <div className="relative w-full h-56 sm:h-80">
          <Image
            src={blog.featured_image}
            alt={blog.title}
            fill
            className="object-cover w-full h-full"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
      )}
      <div className="px-6 sm:px-10 py-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{blog.title}</h1>
        <div className="flex items-center gap-4 text-gray-500 text-sm mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {blog.created_at ? new Date(blog.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }) : 'No date available'}
          </span>
          {blog.categories && blog.categories.length > 0 && (
            <span className="text-blue-600 font-medium">
              {blog.categories.map((cat: Category) => cat.name).join(', ')}
            </span>
          )}
        </div>
        {blog.excerpt && (
          <p className="text-lg text-gray-600 leading-relaxed">{blog.excerpt}</p>
        )}
      </div>
    </header>
  )
} 