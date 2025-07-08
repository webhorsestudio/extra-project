import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface BlogBreadcrumbProps {
  blogTitle: string
}

export default function BlogBreadcrumb({ blogTitle }: BlogBreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
      <Link 
        href="/web" 
        className="flex items-center hover:text-gray-700 transition-colors"
        aria-label="Go to homepage"
      >
        <Home className="h-4 w-4 mr-1" />
        Home
      </Link>
      
      <ChevronRight className="h-4 w-4" />
      
      <Link 
        href="/web/blogs" 
        className="hover:text-gray-700 transition-colors"
        aria-label="Go to blogs page"
      >
        Blogs
      </Link>
      
      <ChevronRight className="h-4 w-4" />
      
      <span className="text-gray-900 font-medium truncate" title={blogTitle}>
        {blogTitle}
      </span>
    </nav>
  )
} 