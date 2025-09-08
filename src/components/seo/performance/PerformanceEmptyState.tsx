/**
 * Performance Empty State Component
 * Empty state when no performance data is available
 */

import { Zap } from 'lucide-react'

export function PerformanceEmptyState() {
  return (
    <div className="text-center py-12">
      <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Performance Data</h3>
      <p className="text-gray-600">Performance data will appear here once monitoring is set up.</p>
    </div>
  )
}
