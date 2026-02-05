import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import PageList from '@/components/admin/pages/PageList'

export default async function PagesPage() {
  const supabase = await createSupabaseAdminClient()
  
  // Fetch pages data server-side
  const { data: pages, error } = await supabase
    .from('pages')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching pages:', error)
  }

  return (
    <div className="container py-6">
      <PageList initialPages={pages || []} />
    </div>
  )
} 
