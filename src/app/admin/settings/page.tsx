import { redirect } from 'next/navigation'

export default function SettingsPage() {
  // Redirect to website settings by default
  redirect('/admin/settings/website')
} 
