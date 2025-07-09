import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createSupabaseApiClient } from '@/lib/supabase/api'
import { jsonToHtml } from '@/lib/content-utils'

interface PolicyPageProps {
  params: Promise<{ type: string }>
}

export async function generateMetadata({ params }: PolicyPageProps): Promise<Metadata> {
  const { type } = await params;
  const supabase = await createSupabaseApiClient()
  
  const { data: policy } = await supabase
    .from('policies')
    .select('name, description')
    .eq('policy_type', type)
    .eq('is_active', true)
    .single()

  if (!policy) {
    return {
      title: 'Policy Not Found',
      description: 'The requested policy could not be found.'
    }
  }

  return {
    title: policy.name,
    description: policy.description || `${policy.name} - Legal policy information`
  }
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { type } = await params;
  const supabase = await createSupabaseApiClient()
  
  const { data: policy, error } = await supabase
    .from('policies')
    .select('*')
    .eq('policy_type', type)
    .eq('is_active', true)
    .single()

  if (error || !policy) {
    notFound()
  }

  const policyTypeLabels: Record<string, string> = {
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    refund: 'Refund Policy',
    shipping: 'Shipping Policy',
    cancellation: 'Cancellation Policy',
    general: 'General Policy'
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {policy.name}
        </h1>
        {policy.description && (
          <p className="text-lg text-gray-600 mb-4">
            {policy.description}
          </p>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Last updated: {new Date(policy.content_updated_at || policy.updated_at).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="prose prose-lg max-w-none">
        {(() => {
          try {
            return <div dangerouslySetInnerHTML={{ __html: jsonToHtml(policy.content || 'No content available') }} />
          } catch (error) {
            console.error('Error displaying policy content:', error)
            return <div className="text-red-500">Error displaying content</div>
          }
        })()}
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200">
        <p className="text-sm text-gray-500 text-center">
          If you have any questions about this {policyTypeLabels[policy.policy_type]?.toLowerCase()}, 
          please contact us.
        </p>
      </div>
    </div>
  )
} 