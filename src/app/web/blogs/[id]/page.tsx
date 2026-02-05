import { createSupabaseServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import ServerLayout from '@/components/web/ServerLayout'
import BlogBreadcrumb from '@/components/web/blog/BlogBreadcrumb'
import BlogHeader from '@/components/web/blog/BlogHeader'
import BlogContent from '@/components/web/blog/BlogContent'
import BlogMeta from '@/components/web/blog/BlogMeta'
import BlogShare from '@/components/web/blog/BlogShare'
import BlogRelated from '@/components/web/blog/BlogRelated'
import { editorjsToHtml } from '@/lib/editorjsToHtml'

interface BlogPageProps {
  params: Promise<{ id: string }>
}

async function getBlog(id: string) {
  try {
    const supabase = await createSupabaseServerClient()
    
    const { data, error } = await supabase
      .from('blogs_with_categories')
      .select('*')
      .eq('id', id)
      .eq('status', 'published')
      .single()

    if (error) {
      console.error('Blog fetch error:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Blog fetch exception:', error)
    return null
  }
}

export default async function BlogPage({ params }: BlogPageProps) {
  try {
    const resolvedParams = await params
    const blog = await getBlog(resolvedParams.id)
    
    if (!blog) {
      return notFound()
    }

    return (
      <ServerLayout showCategoryBar={false}>
        <div className="min-h-screen bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <BlogBreadcrumb blogTitle={blog.title} />
            
            <Suspense fallback={<div className="animate-pulse h-96 bg-gray-200 rounded-lg" />}>
              <BlogHeader blog={blog} />
            </Suspense>
            
            <div className="mt-8">
              <Suspense fallback={<div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>}>
                <BlogMeta blog={blog} />
              </Suspense>
              
              <Suspense fallback={<div className="animate-pulse space-y-4 mt-8">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>}>
                <BlogContent content={editorjsToHtml(blog.content)} />
              </Suspense>
              
              <Suspense fallback={<div className="animate-pulse h-8 bg-gray-200 rounded w-32 mt-8" />}>
                <BlogShare blog={blog} />
              </Suspense>
            </div>
            
            <Suspense fallback={<div className="animate-pulse space-y-4 mt-12">
              <div className="h-8 bg-gray-200 rounded w-48"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-64 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>}>
              <BlogRelated currentBlogId={blog.id} />
            </Suspense>
          </div>
        </div>
      </ServerLayout>
    )
  } catch (_error) {
    console.error('Blog page error:', _error)
    return notFound()
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPageProps) {
  try {
    const resolvedParams = await params
    const blog = await getBlog(resolvedParams.id)
    
    if (!blog) {
      return {
        title: 'Blog Not Found',
        description: 'The requested blog post could not be found.'
      }
    }

    return {
      title: blog.title,
      description: blog.excerpt,
      openGraph: {
        title: blog.title,
        description: blog.excerpt,
        images: blog.featured_image ? [blog.featured_image] : [],
      },
    }
  } catch {
    return {
      title: 'Blog',
      description: 'Blog post'
    }
  }
} 