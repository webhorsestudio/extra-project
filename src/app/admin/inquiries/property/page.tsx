import { checkAdminAuth } from '@/lib/admin-data'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import PropertyInquiriesClient from '@/components/admin/inquiries/PropertyInquiriesClient'

export default async function PropertyInquiriesPage() {
  const { user, profile } = await checkAdminAuth()
  
  if (!user || profile?.role !== 'admin') {
    redirect('/users/login')
  }

  // Fetch property inquiries using the view
  const supabase = await createSupabaseAdminClient()
  const { data: inquiries, error } = await supabase
    .from('property_inquiries_view')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching property inquiries:', error)
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Property Inquiries</h1>
        <p className="text-gray-600 mt-2">
          Manage property inquiries from the Contact Now form
        </p>
      </div>
      
      <PropertyInquiriesClient initialInquiries={inquiries || []} />
    </div>
  )
} 