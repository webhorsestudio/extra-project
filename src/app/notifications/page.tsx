import ServerLayout from '@/components/web/ServerLayout'
import NotificationsContent from './NotificationsContent'
import { getNotificationsData } from '@/lib/notifications-data-server'

export default async function NotificationsPage() {
  const initialNotifications = await getNotificationsData()
  return (
    <ServerLayout showCategoryBar={false}>
      <NotificationsContent initialNotifications={initialNotifications} />
    </ServerLayout>
  )
} 