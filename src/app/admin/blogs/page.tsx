import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { BlogList } from '@/components/admin/blogs/BlogList'

export default async function BlogsPage() {
  // Create server client for authentication
  const supabase = await createSupabaseServerClient()
  
  // Get user session
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/admin/login')
  }

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || profile.role !== 'admin') {
    redirect('/admin/login')
  }

  // Fetch blogs data server-side
  const adminSupabase = await createSupabaseAdminClient()
  
  const { data: blogs, error: blogsError } = await adminSupabase
    .from('blogs')
    .select(`*, category:blog_categories(name), featured_image`)
    .order('created_at', { ascending: false })

  if (blogsError) {
    console.error('Error fetching blogs:', blogsError)
    throw new Error('Failed to fetch blogs')
  }

  return (
    <div className="container py-8 max-w-7xl">
      <BlogList initialBlogs={blogs || []} />
    </div>
  )
} 
