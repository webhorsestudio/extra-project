import { Metadata } from 'next'
import { createSupabaseApiClient } from '@/lib/supabase/api'
import { jsonToHtml } from '@/lib/content-utils'
import ServerLayout from '@/components/web/ServerLayout'
import './terms.css'

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createSupabaseApiClient()
  
  const { data: policy } = await supabase
    .from('policies')
    .select('name, description')
    .eq('policy_type', 'terms')
    .eq('is_active', true)
    .single()

  if (!policy) {
    return {
      title: 'Terms and Conditions',
      description: 'Terms and conditions for using our services.'
    }
  }

  return {
    title: policy.name || 'Terms and Conditions',
    description: policy.description || 'Terms and conditions for using our services.'
  }
}

export default async function TermsPage() {
  const supabase = await createSupabaseApiClient()
  
  const { data: policy, error } = await supabase
    .from('policies')
    .select('*')
    .eq('policy_type', 'terms')
    .eq('is_active', true)
    .single()

  // If no terms policy exists in database, show a fallback message
  if (error || !policy) {
    return (
      <ServerLayout showCategoryBar={false}>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms and Conditions</h1>
              <p className="text-gray-500 mb-4">Content not available</p>
              <p className="text-sm text-gray-400">Please check back later or contact support for assistance.</p>
            </div>
          </div>
        </div>
      </ServerLayout>
    )
  }

  return (
    <ServerLayout showCategoryBar={false}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-black px-8 py-12 text-white">
            <h1 className="text-4xl font-bold mb-2">{policy.name || 'Terms and Conditions'}</h1>
            {policy.description && (
              <p className="text-gray-200 text-lg mb-4">{policy.description}</p>
            )}
            <div className="flex items-center text-gray-300 text-sm">
              <span>Last updated: {new Date(policy.content_updated_at || policy.updated_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-12">
            <div className="prose prose-lg max-w-none">
              <div 
                className="terms-content"
                dangerouslySetInnerHTML={{ __html: jsonToHtml(policy.content || 'No content available') }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-8 border-t border-gray-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions about these terms?</h3>
              <p className="text-gray-600 mb-4">
                If you have any questions about these terms and conditions, please contact us.
              </p>
              <a 
                href="/contact" 
                className="inline-flex items-center px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </ServerLayout>
  )
} 