import { checkAdminAuth } from '@/lib/admin-data'
import { createSupabaseAdminUserClient } from '@/lib/supabase/admin'
import LocationClient from './LocationClient'

export default async function LocationPage() {
  await checkAdminAuth()
  await createSupabaseAdminUserClient() // Keep for possible side effects or future use

  return <LocationClient />
} 
