import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import AddFAQClient from '@/components/admin/faqs/AddFAQClient'

export default async function AddFAQPage() {
  // SSR admin check
  const supabase = await createSupabaseAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/admin/login')
  }

  return (
    <div className="container py-6">
      <AddFAQClient />
    </div>
  )
} 