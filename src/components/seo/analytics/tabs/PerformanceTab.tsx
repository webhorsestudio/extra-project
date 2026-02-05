'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { SEOAnalyticsData } from '@/types/seo-analytics'

interface PerformanceTabProps {
  data: SEOAnalyticsData
}

export function PerformanceTab({ data }: PerformanceTabProps) {
  const performance = data.performance || {
    pageSpeed: { desktop: 0, mobile: 0 },
    coreWebVitals: { lcp: 0, fid: 0, cls: 0 },
    mobileUsability: 0
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">Performance analysis coming soon...</p>
            <p className="text-sm text-gray-400 mt-2">
              Desktop: {performance.pageSpeed.desktop} | Mobile: {performance.pageSpeed.mobile} | LCP: {performance.coreWebVitals.lcp}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
