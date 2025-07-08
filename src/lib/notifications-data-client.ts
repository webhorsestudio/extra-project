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

export async function getNotificationsDataClient(): Promise<NotificationData[]> {
  try {
    const response = await fetch('/api/notifications')
    
    if (!response.ok) {
      console.error('Error fetching notifications data:', response.statusText)
      return []
    }

    const data = await response.json()
    return data.notifications || []
  } catch (error) {
    console.error('Error fetching notifications data:', error)
    return []
  }
} 