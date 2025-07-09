import { createSupabaseApiClient } from '@/lib/supabase/api'
import { jsonToHtml } from '@/lib/content-utils'
import MobilePrivacyClient from './MobilePrivacyClient'

export default async function MobilePrivacyPage() {
  const supabase = await createSupabaseApiClient()
  
  const { data: policy, error } = await supabase
    .from('policies')
    .select('*')
    .eq('policy_type', 'privacy')
    .eq('is_active', true)
    .single()

  // Process the content to convert JSON to HTML if needed
  let processedPolicy = null
  if (policy) {
    processedPolicy = {
      ...policy,
      content: jsonToHtml(policy.content || '')
    }
  }

  return (
    <MobilePrivacyClient policy={processedPolicy} error={error?.message || null} />
  )
} 