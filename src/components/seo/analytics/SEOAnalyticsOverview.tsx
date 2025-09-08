'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Eye, 
  MousePointer, 
  Target, 
  TrendingUp, 
  TrendingDown 
} from 'lucide-react'
import type { SEOAnalyticsData } from '@/types/seo-analytics'

interface SEOAnalyticsOverviewProps {
  data: SEOAnalyticsData
}

export function SEOAnalyticsOverview({ data }: SEOAnalyticsOverviewProps) {
  const overview = data.overview || {
    totalSessions: 0,
    averageSessionDuration: 0,
    bounceRate: 0,
    conversionRate: 0
  }
  
  const overviewCards = [
    {
      title: 'Total Sessions',
      value: overview.totalSessions.toLocaleString(),
      icon: Users,
      iconColor: 'text-blue-600',
      trend: '+12.5%',
      trendColor: 'text-green-600',
      trendIcon: TrendingUp
    },
    {
      title: 'Avg. Session Duration',
      value: `${Math.round(overview.averageSessionDuration)}s`,
      icon: Eye,
      iconColor: 'text-green-600',
      trend: '+8.2%',
      trendColor: 'text-green-600',
      trendIcon: TrendingUp
    },
    {
      title: 'Bounce Rate',
      value: `${Math.round(overview.bounceRate)}%`,
      icon: MousePointer,
      iconColor: 'text-orange-600',
      trend: '-3.1%',
      trendColor: 'text-red-600',
      trendIcon: TrendingDown
    },
    {
      title: 'Conversion Rate',
      value: `${overview.conversionRate.toFixed(1)}%`,
      icon: Target,
      iconColor: 'text-purple-600',
      trend: '+15.3%',
      trendColor: 'text-green-600',
      trendIcon: TrendingUp
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {overviewCards.map((card, index) => {
        const IconComponent = card.icon
        const TrendIcon = card.trendIcon
        
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
                <IconComponent className={`h-8 w-8 ${card.iconColor}`} />
              </div>
              <div className="mt-2">
                <Badge variant="outline" className={card.trendColor}>
                  <TrendIcon className="h-3 w-3 mr-1" />
                  {card.trend}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

