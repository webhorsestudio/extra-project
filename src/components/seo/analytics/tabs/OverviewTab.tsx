'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Globe, 
  ExternalLink, 
  Smartphone 
} from 'lucide-react'
import type { SEOAnalyticsData } from '@/types/seo-analytics'

interface OverviewTabProps {
  data: SEOAnalyticsData
}

export function OverviewTab({ data }: OverviewTabProps) {
  const traffic = data.traffic || { organic: 0, direct: 0, referral: 0, social: 0 }
  const keywords = data.keywords || { 
    totalKeywords: 0, 
    averagePosition: 0, 
    rankingChanges: { improved: 0, declined: 0, stable: 0 } 
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Traffic Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-blue-600" />
                <span>Organic Search</span>
              </div>
              <span className="font-semibold">{traffic.organic}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-green-600" />
                <span>Direct Traffic</span>
              </div>
              <span className="font-semibold">{traffic.direct}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-orange-600" />
                <span>Referral</span>
              </div>
              <span className="font-semibold">{traffic.referral}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-purple-600" />
                <span>Social</span>
              </div>
              <span className="font-semibold">{traffic.social}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Keyword Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Total Keywords</span>
              <Badge variant="outline">{keywords.totalKeywords}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Average Position</span>
              <Badge variant="outline">{keywords.averagePosition.toFixed(1)}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Improved Rankings</span>
              <Badge className="bg-green-100 text-green-800">
                {keywords.rankingChanges.improved}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Declined Rankings</span>
              <Badge className="bg-red-100 text-red-800">
                {keywords.rankingChanges.declined}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

