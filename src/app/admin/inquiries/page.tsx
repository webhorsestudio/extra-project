import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import InquiriesClient from './InquiriesClient'

export default async function InquiriesPage() {
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

  // Fetch inquiries data server-side
  const adminSupabase = await createSupabaseAdminClient()
  
  const { data: inquiries, error: inquiriesError } = await adminSupabase
    .from('inquiries')
    .select(`
      *,
      property:properties(id, title)
    `)
    .order('created_at', { ascending: false })

  if (inquiriesError) {
    console.error('Error fetching inquiries:', inquiriesError)
    throw new Error('Failed to fetch inquiries')
  }

  return <InquiriesClient initialInquiries={inquiries || []} />
}

