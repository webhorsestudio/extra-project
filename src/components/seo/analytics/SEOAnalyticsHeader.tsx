'use client'

import { Button } from '@/components/ui/button'

interface SEOAnalyticsHeaderProps {
  period: string
  onPeriodChange: (period: string) => void
}

export function SEOAnalyticsHeader({ period, onPeriodChange }: SEOAnalyticsHeaderProps) {
  const periods = [
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
    { value: '90d', label: '90d' }
  ]

  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-gray-900">SEO Analytics</h2>
      <div className="flex gap-2">
        {periods.map((p) => (
          <Button
            key={p.value}
            variant={period === p.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPeriodChange(p.value)}
          >
            {p.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

