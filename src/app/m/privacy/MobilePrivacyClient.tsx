"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Calendar, Shield } from 'lucide-react'
import { HydrationSuppressor } from '@/components/HydrationSuppressor'

interface MobilePrivacyClientProps {
  policy: {
    name?: string
    description?: string
    content?: string
    content_updated_at?: string
    updated_at?: string
  } | null
  error?: string | null
}

export default function MobilePrivacyClient({ policy, error }: MobilePrivacyClientProps) {
  // If no privacy policy exists in database, show a fallback message
  if (error || !policy) {
    return (
      <HydrationSuppressor>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 px-4 py-3">
            <div className="flex items-center justify-between">
              <a href="/m" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Back</span>
              </a>
              <h1 className="text-lg font-semibold text-gray-900">Privacy Policy</h1>
              <div className="w-16"></div>
            </div>
          </div>

          <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
            <div className="text-center max-w-sm">
              <div className="flex items-center justify-center mb-4">
                <Shield className="h-12 w-12 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Privacy Policy</h2>
              <p className="text-gray-500 mb-4 text-sm">Content not available</p>
              <p className="text-xs text-gray-400">Please check back later or contact support for assistance.</p>
              <Button 
                asChild
                className="mt-4"
                size="sm"
              >
                <a href="/m/contact">Contact Support</a>
              </Button>
            </div>
          </div>
        </div>
      </HydrationSuppressor>
    )
  }

  return (
    <HydrationSuppressor>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <a href="/m" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Back</span>
            </a>
            <h1 className="text-lg font-semibold text-gray-900">Privacy Policy</h1>
            <div className="w-16"></div>
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Header Section */}
          <Card className="bg-gradient-to-r from-gray-900 to-black text-white border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold mb-2">
                {policy.name || 'Privacy Policy'}
              </CardTitle>
              {policy.description && (
                <p className="text-gray-200 text-sm mb-3">{policy.description}</p>
              )}
              <div className="flex items-center text-gray-300 text-xs">
                <Calendar className="w-4 h-4 mr-2" />
                <span>
                  Last updated: {new Date(policy.content_updated_at || policy.updated_at || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </CardHeader>
          </Card>

          {/* Content */}
          <Card className="bg-white/90 backdrop-blur-md border-gray-200/50">
            <CardContent className="p-6">
              <div className="mobile-privacy-content">
                <div 
                  className="privacy-content"
                  dangerouslySetInnerHTML={{ __html: policy.content || 'No content available' }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <Card className="bg-white/90 backdrop-blur-md border-gray-200/50">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Questions about this policy?</h3>
              <p className="text-gray-600 mb-4 text-sm">
                If you have any questions about this privacy policy, please contact us.
              </p>
              <Button 
                asChild
                size="sm"
              >
                <a href="/m/contact">Contact Support</a>
              </Button>
            </CardContent>
          </Card>
        </div>

        <style jsx>{`
          .mobile-privacy-content {
            line-height: 1.6;
            color: #374151;
            font-size: 0.875rem;
          }

          .mobile-privacy-content h2 {
            color: #1f2937;
            font-size: 1.125rem;
            font-weight: 600;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
            padding-bottom: 0.25rem;
            border-bottom: 1px solid #e5e7eb;
          }

          .mobile-privacy-content h3 {
            color: #1f2937;
            font-size: 1rem;
            font-weight: 600;
            margin-top: 1.25rem;
            margin-bottom: 0.5rem;
          }

          .mobile-privacy-content p {
            margin-bottom: 0.75rem;
            color: #4b5563;
          }

          .mobile-privacy-content ul {
            margin-bottom: 0.75rem;
            padding-left: 1.25rem;
          }

          .mobile-privacy-content li {
            margin-bottom: 0.25rem;
            color: #4b5563;
          }

          .mobile-privacy-content strong {
            color: #1f2937;
            font-weight: 600;
          }

          .mobile-privacy-content a {
            color: #000000;
            text-decoration: underline;
            transition: color 0.2s;
          }

          .mobile-privacy-content a:hover {
            color: #374151;
          }

          .mobile-privacy-content blockquote {
            border-left: 3px solid #000000;
            padding-left: 0.75rem;
            margin: 1rem 0;
            font-style: italic;
            color: #6b7280;
          }

          .mobile-privacy-content code {
            background-color: #f3f4f6;
            padding: 0.125rem 0.25rem;
            border-radius: 0.25rem;
            font-family: 'Courier New', monospace;
            font-size: 0.75rem;
          }
        `}</style>
      </div>
    </HydrationSuppressor>
  )
} 