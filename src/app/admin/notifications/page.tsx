import { checkAdminAuth } from '@/lib/admin-data'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import NotificationsClient from '@/components/admin/notifications/NotificationsClient'

export default async function NotificationsPage() {
  const { user, profile } = await checkAdminAuth()
  
  if (!user || profile?.role !== 'admin') {
    redirect('/admin/login')
  }

  // Fetch initial notifications data using admin client
  const supabase = await createSupabaseAdminClient()
  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching notifications:', error)
    throw new Error('Failed to fetch notifications')
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600 mt-2">
          Manage system notifications and alerts
        </p>
      </div>
      
      <NotificationsClient initialNotifications={notifications || []} />
    </div>
  )
} 