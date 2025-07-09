import { navigationItems } from './navigationConfig'

export function getAdminNavigationItems(profile: { role?: string } | null) {
  // Example: Only show all items for admin, restrict for other roles in the future
  if (profile?.role === 'admin') {
    return navigationItems
  }
  // You can add more role-based filtering here
  return navigationItems.filter(item => item.name === 'Dashboard')
} 