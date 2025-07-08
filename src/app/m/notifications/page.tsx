import { getNotificationsData } from '@/lib/notifications-data-server';
import MobileNotificationsContent from '@/components/mobile/MobileNotificationsContent';

export default async function MobileNotificationsPage() {
  const initialNotifications = await getNotificationsData();
  return <MobileNotificationsContent initialNotifications={initialNotifications} />;
} 