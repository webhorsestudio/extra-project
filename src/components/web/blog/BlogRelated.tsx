import { createSupabaseServerClient } from '@/lib/supabase/server'
import BlogCard from '../BlogCard'

export default async function BlogRelated({ currentBlogId }: { currentBlogId: string }) {
  try {
    const supabase = await createSupabaseServerClient()
    
    const { data, error } = await supabase
      .from('blogs_with_categories')
      .select('*')
      .eq('status', 'published')
      .neq('id', currentBlogId)
      .order('created_at', { ascending: false })
      .limit(3)

    if (error) {
      console.error('Related blogs fetch error:', error)
      return null
    }

    if (!data || data.length === 0) {
      return null
    }

    return (
      <section className="mt-12">
        <h3 className="text-2xl font-bold mb-6 text-gray-900">Related Posts</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.map(blog => (
            <div key={blog.id} className="w-full">
              <BlogCard blog={blog} />
            </div>
          ))}
        </div>
      </section>
    )
  } catch (error) {
    console.error('BlogRelated error:', error)
    return null
  }
} 