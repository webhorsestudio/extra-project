import { Calendar } from 'lucide-react'

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  featured_image: string | null;
  created_at?: string;
}

export default function BlogMeta({ blog }: { blog: Blog }) {
  return (
    <div className="flex items-center gap-4 text-gray-500 text-sm mb-4">
      <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{blog.created_at ? new Date(blog.created_at).toLocaleDateString() : '—'}</span>
      {/* Add author, tags, etc. here if available */}
    </div>
  )
} 