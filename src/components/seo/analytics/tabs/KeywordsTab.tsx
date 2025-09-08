'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { SEOAnalyticsData } from '@/types/seo-analytics'

interface KeywordsTabProps {
  data: SEOAnalyticsData
}

export function KeywordsTab({ data }: KeywordsTabProps) {
  const keywords = data.keywords || { 
    totalKeywords: 0, 
    topKeywords: [],
    rankingChanges: { improved: 0, declined: 0, stable: 0 },
    averagePosition: 0
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Keyword Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">Keyword analysis coming soon...</p>
            <p className="text-sm text-gray-400 mt-2">
              Total Keywords: {keywords.totalKeywords} | Avg Position: {keywords.averagePosition.toFixed(1)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
