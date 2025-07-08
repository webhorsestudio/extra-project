import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { CategoryList } from '@/components/admin/blogs/CategoryList'

export default async function CategoriesPage() {
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
    .order('created_at', { ascending: false })

  if (categoriesError) {
    console.error('Error fetching blog categories:', categoriesError)
    throw new Error('Failed to fetch blog categories')
  }

  return (
    <div className="container py-8 max-w-7xl">
      <CategoryList initialCategories={categories || []} />
    </div>
  )
} 
