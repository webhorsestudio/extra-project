import { checkAdminAuth } from '@/lib/admin-data'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import TourBookingsClient from '@/components/admin/inquiries/TourBookingsClient'

export default async function TourBookingsPage() {
  const { user, profile } = await checkAdminAuth()
  
  if (!user || profile?.role !== 'admin') {
    redirect('/users/login')
  }

  // Fetch tour bookings using the view
  const supabase = await createSupabaseAdminClient()
  const { data: bookings, error } = await supabase
    .from('tour_bookings_view')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tour bookings:', error)
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tour Bookings</h1>
        <p className="text-gray-600 mt-2">
          Manage tour booking requests from the Request a Tour form
        </p>
      </div>
      
      <TourBookingsClient initialBookings={bookings || []} />
    </div>
  )
} 