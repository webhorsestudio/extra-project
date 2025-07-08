import { checkAdminAuth } from '@/lib/admin-data'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import SupportInquiriesClient from '@/components/admin/inquiries/SupportInquiriesClient'

export default async function SupportInquiriesPage() {
  const { user, profile } = await checkAdminAuth()
  
  if (!user || profile?.role !== 'admin') {
    redirect('/admin/login')
  }

  // Fetch support inquiries using the admin client
  const supabase = await createSupabaseAdminClient()
  const { data: inquiries, error } = await supabase
    .from('inquiries')
    .select('*')
    .eq('inquiry_type', 'support')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching support inquiries:', error)
    throw new Error('Failed to fetch support inquiries')
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Support Inquiries</h1>
        <p className="text-gray-600 mt-2">
          Manage support inquiries from the Support form
        </p>
      </div>
      
      <SupportInquiriesClient initialInquiries={inquiries || []} />
    </div>
  )
} 