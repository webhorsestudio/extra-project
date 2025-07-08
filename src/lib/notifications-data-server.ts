import { createSupabaseServerClient } from '@/lib/supabase/server'

export interface NotificationData {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  category: 'system' | 'user' | 'property' | 'inquiry'
  status: 'unread' | 'read'
  created_at: string
  updated_at: string
  expires_at: string
  created_by?: string
  creator_name?: string
}

export async function getNotificationsData(): Promise<NotificationData[]> {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Add caching for better performance
    const cacheOptions = {
      next: { revalidate: 300 } // Cache for 5 minutes
    }
    
    // Fetch notifications for the current user
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50) // Limit to recent notifications
    
    if (error) {
      console.error('Error fetching notifications data:', error)
      return []
    }

    // Get creator information for notifications that have created_by
    const creatorIds = notifications
      ?.map(n => n.created_by)
      .filter(Boolean) || []
    
    let creators: any[] = []
    if (creatorIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', creatorIds)
      
      creators = profiles || []
    }

    // Transform the data to include creator name
    const transformedNotifications = notifications?.map(notification => {
      const creator = creators.find(c => c.id === notification.created_by)
      return {
        ...notification,
        creator_name: creator?.full_name || 'System'
      }
    }) || []

    return transformedNotifications
  } catch (error) {
    console.error('Error fetching notifications data:', error)
    return []
  }
} 