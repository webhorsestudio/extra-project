import React from 'react'

interface TermsContentProps {
  policy: {
    name: string
    description?: string
    content: string
    content_updated_at?: string
    updated_at: string
  } | null
}

export default function TermsContent({ policy }: TermsContentProps) {
  if (!policy) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms and Conditions</h1>
            <p className="text-gray-500 mb-4">Content not available</p>
            <p className="text-sm text-gray-400">Please check back later or contact support for assistance.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-12 text-white">
          <h1 className="text-4xl font-bold mb-2">{policy.name}</h1>
          {policy.description && (
            <p className="text-green-100 text-lg mb-4">{policy.description}</p>
          )}
          <div className="flex items-center text-green-100 text-sm">
            <span>Last updated: {new Date(policy.content_updated_at || policy.updated_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-12">
          <div className="prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: policy.content || 'No content available' }} />
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
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 