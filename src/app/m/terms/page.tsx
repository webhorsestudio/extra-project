import { createSupabaseServerClient } from '@/lib/supabase/server'
import MobileTermsClient from './MobileTermsClient'

export default async function MobileTermsPage() {
  const supabase = await createSupabaseServerClient()
  
  const { data: policy, error } = await supabase
    .from('policies')
    .select('*')
    .eq('policy_type', 'terms')
    .eq('is_active', true)
    .single()

  return (
    <MobileTermsClient policy={policy} error={error} />
  )
} 