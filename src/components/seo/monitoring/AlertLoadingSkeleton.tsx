/**
 * Alert Loading Skeleton Component
 * Loading state for alerts
 */

import { Card, CardContent } from '@/components/ui/card'

interface AlertLoadingSkeletonProps {
  className?: string
}

export function AlertLoadingSkeleton({ className = '' }: AlertLoadingSkeletonProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="animate-pulse">
          <CardContent className="p-4">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
