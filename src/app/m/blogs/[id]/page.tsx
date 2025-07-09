import { createSupabaseServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import MobileBlogPageClient from './MobileBlogPageClient'
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
  } catch {
    console.error('Blog fetch exception:')
    return null
  }
}

async function getRelatedBlogs(currentBlogId: string) {
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
      return []
    }

    return data || []
  } catch {
    console.error('Related blogs fetch exception:')
    return []
  }
}

export default async function MobileBlogPage({ params }: BlogPageProps) {
  try {
    const resolvedParams = await params
    const blog = await getBlog(resolvedParams.id)
    
    if (!blog) {
      return notFound()
    }

    const relatedBlogs = await getRelatedBlogs(blog.id)

    return (
      <MobileBlogPageClient 
        blog={blog} 
        relatedBlogs={relatedBlogs}
        content={editorjsToHtml(blog.content)}
      />
    )
  } catch {
    console.error('Mobile blog page error:')
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