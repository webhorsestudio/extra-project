import { checkAdminAuth } from '@/lib/admin-data'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import ContactInquiriesClient from '@/components/admin/inquiries/ContactInquiriesClient'

export default async function ContactInquiriesPage() {
  const { user, profile } = await checkAdminAuth()
  
  if (!user || profile?.role !== 'admin') {
    redirect('/admin/login')
  }

  // Fetch contact inquiries using the admin client
  const supabase = await createSupabaseAdminClient()
  const { data: inquiries, error } = await supabase
    .from('inquiries')
    .select('*')
    .eq('inquiry_type', 'contact')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching contact inquiries:', error)
    throw new Error('Failed to fetch contact inquiries')
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Contact Inquiries</h1>
        <p className="text-gray-600 mt-2">
          Manage contact inquiries from the Contact form
        </p>
      </div>
      
      <ContactInquiriesClient initialInquiries={inquiries || []} />
    </div>
  )
} 