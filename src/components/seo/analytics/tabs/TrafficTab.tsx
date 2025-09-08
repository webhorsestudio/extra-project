'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { SEOAnalyticsData } from '@/types/seo-analytics'

interface TrafficTabProps {
  data: SEOAnalyticsData
}

export function TrafficTab({ data }: TrafficTabProps) {
  const traffic = data.traffic || { organic: 0, direct: 0, referral: 0, social: 0 }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Traffic Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">Traffic analysis coming soon...</p>
            <p className="text-sm text-gray-400 mt-2">
              Organic: {traffic.organic} | Direct: {traffic.direct} | Referral: {traffic.referral} | Social: {traffic.social}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
