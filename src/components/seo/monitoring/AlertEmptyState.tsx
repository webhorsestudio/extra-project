/**
 * Alert Empty State Component
 * Empty state when no alerts are present
 */

import { CheckCircle } from 'lucide-react'

interface AlertEmptyStateProps {
  className?: string
}

export function AlertEmptyState({ className = '' }: AlertEmptyStateProps) {
  return (
    <div className={`text-center py-8 ${className}`}>
      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">All Good!</h3>
      <p className="text-gray-600">No active SEO alerts at the moment.</p>
    </div>
  )
}
