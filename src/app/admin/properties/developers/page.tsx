import { checkAdminAuth } from '@/lib/admin-data'
import { createSupabaseAdminUserClient } from '@/lib/supabase/admin'
import DevelopersClient from './DevelopersClient'

export default async function DevelopersPage() {
  // Check admin authentication
  await checkAdminAuth()
  
  const supabase = await createSupabaseAdminUserClient()
  
  try {
    const { data: developers, error } = await supabase
      .from('property_developers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching developers:', error)
      return <DevelopersClient developers={[]} />
    }

    return <DevelopersClient developers={developers || []} />
  } catch (error) {
    console.error('Error in DevelopersPage:', error)
    return <DevelopersClient developers={[]} />
  }
} 