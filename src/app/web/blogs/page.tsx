import { createSupabaseServerClient } from '@/lib/supabase/server'
import ServerLayout from '@/components/web/ServerLayout'
import BlogCarousel from '@/components/web/BlogCarousel'

async function getBlogs() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('blogs_with_categories')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching blogs:', error)
    return []
  }
  
  // Map the data to match the expected schema
  return (data || []).map(blog => ({
    id: blog.id,
    title: blog.title,
    excerpt: blog.excerpt,
    featured_image: blog.featured_image,
    created_at: blog.created_at,
    categories: blog.categories || []
  }))
}

export default async function WebBlogsPage() {
  const blogs = await getBlogs()

  return (
    <ServerLayout showCategoryBar={false}>
      <div className="min-h-screen bg-gray-50">
        <section className="py-4 sm:py-6 lg:py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold">Latest Blog Posts</h2>
              <p className="text-gray-500 mt-2">Stay updated with real estate insights and market trends</p>
            </div>
            
            {blogs.length === 0 ? (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No blog posts available</h3>
                  <p className="text-gray-600 text-sm">Check back soon for the latest insights and updates!</p>
                </div>
              </div>
            ) : (
              <BlogCarousel blogs={blogs} titleAlign="none" />
            )}
          </div>
        </section>
      </div>
    </ServerLayout>
  )
} 