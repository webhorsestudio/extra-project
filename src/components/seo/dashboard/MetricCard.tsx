'use client'

import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: number
  icon: React.ReactNode
  trend: 'up' | 'down' | 'stable'
}

export function MetricCard({ title, value, icon, trend }: MetricCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <div className="h-4 w-4" />
    }
  }

  // const _getTrendColor = () => {
  //   switch (trend) {
  //     case 'up':
  //       return 'text-green-600'
  //     case 'down':
  //       return 'text-red-600'
  //     default:
  //       return 'text-gray-600'
  //   }
  // }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
          </div>
          <div className="flex items-center space-x-2">
            {icon}
            {getTrendIcon()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
