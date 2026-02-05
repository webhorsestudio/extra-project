'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Target, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

interface SEOAuditScoreProps {
  score: number
  summary: {
    totalIssues: number
    highPriorityIssues: number
    mediumPriorityIssues: number
    lowPriorityIssues: number
    totalRecommendations: number
  }
}

export function SEOAuditScore({ score, summary }: SEOAuditScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>
    if (score >= 40) return <Badge className="bg-orange-100 text-orange-800">Fair</Badge>
    return <Badge className="bg-red-100 text-red-800">Poor</Badge>
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-6 w-6 text-green-600" />
    if (score >= 60) return <TrendingUp className="h-6 w-6 text-yellow-600" />
    return <AlertTriangle className="h-6 w-6 text-red-600" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Overall SEO Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          {/* Main Score */}
          <div className="flex items-center justify-center gap-4">
            {getScoreIcon(score)}
            <div className={`text-5xl font-bold ${getScoreColor(score)}`}>
              {score}
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">out of 100</div>
              {getScoreBadge(score)}
            </div>
          </div>

          {/* Progress Bar */}
          <Progress value={score} className="h-3" />

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{summary.highPriorityIssues}</div>
              <div className="text-sm text-gray-600">High Priority</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{summary.mediumPriorityIssues}</div>
              <div className="text-sm text-gray-600">Medium Priority</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{summary.lowPriorityIssues}</div>
              <div className="text-sm text-gray-600">Low Priority</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.totalRecommendations}</div>
              <div className="text-sm text-gray-600">Recommendations</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
