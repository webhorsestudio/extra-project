import { getCachedBlogs } from '@/lib/blog-cache'
import BlogCarousel from './BlogCarousel'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import BlogErrorFallback from './BlogErrorFallback'
import BlogSkeleton from './BlogSkeleton'
import { Suspense } from 'react'

// Comprehensive Blog interface that matches the data structure from getLatestBlogs
interface Blog {
  id: string;
  title: string;
  excerpt: string;
  featured_image: string | null;
  created_at?: string;
  categories?: Array<{ id: string; name: string }>;
}

// Separate component for the actual blog content
async function BlogContent() {
  const blogs = await getCachedBlogs(6) // Fetch more blogs for carousel

  if (!blogs || blogs.length === 0) {
    return (
      <section className="py-4 sm:py-6 lg:py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">Latest Blog Posts</h2>
            <p className="text-gray-500 mt-2">Stay updated with our latest insights</p>
          </div>
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
        </div>
      </section>
    )
  }

  // Type assertion to ensure blogs match the Blog interface
  const typedBlogs: Blog[] = blogs as Blog[]

  return <BlogCarousel blogs={typedBlogs} title="Latest Blogs" titleAlign="left" />
}

// Loading component for Suspense
function BlogLoading() {
  return (
    <section className="py-4 sm:py-6 lg:py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">Latest Blog Posts</h2>
          <p className="text-gray-500 mt-2">Stay updated with our latest insights</p>
        </div>
        <BlogSkeleton />
      </div>
    </section>
  )
}

export default function LatestBlogs() {
  return (
    <ErrorBoundary fallback={BlogErrorFallback}>
      <Suspense fallback={<BlogLoading />}>
        <BlogContent />
      </Suspense>
    </ErrorBoundary>
  )
} 