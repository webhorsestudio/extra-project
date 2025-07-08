import { createSupabaseApiClient } from '@/lib/supabase/api'
import { jsonToHtml } from '@/lib/content-utils'
import MobileTermsClient from './MobileTermsClient'

export default async function MobileTermsPage() {
  const supabase = await createSupabaseApiClient()
  
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