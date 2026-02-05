/**
 * Page Speed Overview Component
 * Desktop and mobile page speed metrics
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Monitor, Smartphone } from 'lucide-react'

interface PageSpeedOverviewProps {
  pageSpeed?: {
    desktop: number
    mobile: number
  }
}

export function PageSpeedOverview({ pageSpeed }: PageSpeedOverviewProps) {
  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'Good'
    if (score >= 50) return 'Needs Improvement'
    return 'Poor'
  }

  // Provide default values if pageSpeed is undefined
  const desktopScore = pageSpeed?.desktop || 0
  const mobileScore = pageSpeed?.mobile || 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Page Speed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-blue-600" />
              <span>Desktop</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{desktopScore}</span>
              <Badge variant="outline">
                {getScoreBadge(desktopScore)}
              </Badge>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-green-600" />
              <span>Mobile</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{mobileScore}</span>
              <Badge variant="outline">
                {getScoreBadge(mobileScore)}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
