import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import MobileNotificationsContent from '@/components/mobile/MobileNotificationsContent'

export default async function MobileNotificationsPage() {
  // Get the user session server-side
  const supabase = await createSupabaseServerClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    // Redirect to login if not authenticated
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-3">Authentication Required</h1>
          <p className="text-gray-600 mb-6 text-sm">Please log in to view your notifications.</p>
          <a 
            href="/users/login" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  // Fetch notifications data for the authenticated user
  let notifications = null
  let error = null
  
  try {
    const adminClient = await createSupabaseAdminClient()
    const { data, error: fetchError } = await adminClient
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
      .gt('expires_at', new Date().toISOString())

    if (fetchError) {
      error = fetchError.message
    } else {
      // Get creator information for notifications that have created_by
      const creatorIds = data?.map(n => n.created_by).filter(Boolean) || []
      let creators: Array<{ id: string; full_name: string }> = []
      
      if (creatorIds.length > 0) {
        const { data: profiles } = await adminClient
          .from('profiles')
          .select('id, full_name')
          .in('id', creatorIds)
        
        creators = profiles || []
      }

      // Transform the data to include creator name
      notifications = data?.map(notification => {
        const creator = creators.find(c => c.id === notification.created_by)
        return {
          ...notification,
          creator_name: creator?.full_name || 'System'
        }
      }) || []
    }
  } catch (err) {
    error = 'Failed to fetch notifications'
    console.error('Error fetching notifications:', err)
  }

  return (
    <MobileNotificationsContent 
      initialNotifications={notifications}
      error={error}
    />
  )
} 