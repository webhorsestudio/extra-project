import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import FAQCategoriesClient from '@/components/admin/faqs/FAQCategoriesClient'

type FaqCategoryRaw = {
  id: string;
  name: string;
  slug: string;
  description: string;
  faqs?: { count: number }[];
  created_at: string;
  updated_at: string;
};

export default async function FAQCategoriesPage() {
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

  // Fetch FAQ categories data server-side
  const adminSupabase = await createSupabaseAdminClient()
  
  const { data: categories, error: categoriesError } = await adminSupabase
    .from('faq_categories')
    .select(`*, faqs(count)`) // get FAQ count per category
    .order('name', { ascending: true })

  if (categoriesError) {
    console.error('Error fetching FAQ categories:', categoriesError)
    throw new Error('Failed to fetch FAQ categories')
  }

  // Transform the data to include FAQ count
  const transformedCategories = (categories || []).map((cat: FaqCategoryRaw) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    faq_count: cat.faqs?.[0]?.count || 0,
    created_at: cat.created_at,
    updated_at: cat.updated_at
  }))

  return (
    <div className="container py-6">
      <FAQCategoriesClient initialCategories={transformedCategories} />
    </div>
  )
} 