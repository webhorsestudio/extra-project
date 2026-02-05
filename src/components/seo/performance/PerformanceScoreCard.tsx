/**
 * Performance Score Card Component
 * Individual score card with progress bar and badge
 */

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { LucideIcon } from 'lucide-react'

interface PerformanceScoreCardProps {
  title: string
  score: number
  icon: LucideIcon
  iconColor: string
}

export function PerformanceScoreCard({ title, score, icon: Icon, iconColor }: PerformanceScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    if (score >= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
    if (score >= 70) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>
    if (score >= 50) return <Badge className="bg-orange-100 text-orange-800">Needs Improvement</Badge>
    return <Badge className="bg-red-100 text-red-800">Poor</Badge>
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold ${getScoreColor(score)}`}>
              {score}
            </p>
          </div>
          <Icon className={`h-8 w-8 ${iconColor}`} />
        </div>
        <div className="mt-2">
          {getScoreBadge(score)}
        </div>
        <Progress value={score} className="mt-2" />
      </CardContent>
    </Card>
  )
}
