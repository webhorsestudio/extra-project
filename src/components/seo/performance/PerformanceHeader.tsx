/**
 * Performance Header Component
 * Header with title, description, and period selector
 */

import { Button } from '@/components/ui/button'

interface PerformanceHeaderProps {
  period: string
  onPeriodChange: (period: string) => void
}

export function PerformanceHeader({ period, onPeriodChange }: PerformanceHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Performance Monitoring</h2>
        <p className="text-gray-600 mt-1">Track and analyze your site&apos;s performance metrics</p>
      </div>
      <div className="flex gap-2">
        {['7d', '30d', '90d'].map((p) => (
          <Button
            key={p}
            variant={period === p ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPeriodChange(p)}
          >
            {p}
          </Button>
        ))}
      </div>
    </div>
  )
}
