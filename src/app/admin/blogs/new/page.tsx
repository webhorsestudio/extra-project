import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { BlogForm } from '@/components/admin/blogs/BlogForm'

export default async function NewBlogPage() {
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

  // Fetch blog categories data server-side
  const adminSupabase = await createSupabaseAdminClient()
  
  const { data: categories, error: categoriesError } = await adminSupabase
    .from('blog_categories')
    .select('*')
    .order('name')

  if (categoriesError) {
    console.error('Error fetching blog categories:', categoriesError)
    throw new Error('Failed to fetch blog categories')
  }

  return (
    <div className="w-full px-6 py-8">
      <BlogForm categories={categories || []} />
    </div>
  )
} 
