import { Metadata } from 'next'
import { createSupabaseApiClient } from '@/lib/supabase/api'
import { jsonToHtml } from '@/lib/content-utils'
import ServerLayout from '@/components/web/ServerLayout'
import PrivacyPolicyContent from './PrivacyPolicyContent'

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createSupabaseApiClient()
  
  const { data: policy } = await supabase
    .from('policies')
    .select('name, description')
    .eq('policy_type', 'privacy')
    .eq('is_active', true)
    .single()

  if (!policy) {
    return {
      title: 'Privacy Policy',
      description: 'Privacy policy for our services and website.'
    }
  }

  return {
    title: policy.name || 'Privacy Policy',
    description: policy.description || 'Privacy policy for our services and website.'
  }
}

export default async function PrivacyPolicyPage() {
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
    <ServerLayout showCategoryBar={false}>
      <PrivacyPolicyContent policy={processedPolicy} />
    </ServerLayout>
  )
} 