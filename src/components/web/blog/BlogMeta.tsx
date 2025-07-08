import { Calendar } from 'lucide-react'

export default function BlogMeta({ blog }: { blog: any }) {
  return (
    <div className="flex items-center gap-4 text-gray-500 text-sm mb-4">
      <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(blog.created_at).toLocaleDateString()}</span>
      {/* Add author, tags, etc. here if available */}
    </div>
  )
} 