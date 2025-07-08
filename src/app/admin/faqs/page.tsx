import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import FAQsClient from '@/components/admin/faqs/FAQsClient'

export default async function FAQsPage() {
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

  // Fetch FAQs data server-side
  const adminSupabase = await createSupabaseAdminClient()
  
  const { data: faqs, error: faqsError } = await adminSupabase
    .from('faqs')
    .select(`
      *,
      category:faq_categories(name, slug)
    `)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: false })

  if (faqsError) {
    console.error('Error fetching FAQs:', faqsError)
    throw new Error('Failed to fetch FAQs')
  }

  // Transform the data to include category info
  const transformedFAQs = faqs?.map(faq => ({
    ...faq,
    category_name: faq.category?.name || 'General'
  })) || []

  return (
    <div className="container py-6">
      <FAQsClient initialFaqs={transformedFAQs} />
    </div>
  )
} 