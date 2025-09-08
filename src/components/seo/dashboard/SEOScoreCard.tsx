'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Target } from 'lucide-react'

interface SEOScoreCardProps {
  seoScore?: {
    score: number
    grade: string
    breakdown?: Record<string, unknown>
  }
}

export function SEOScoreCard({ seoScore }: SEOScoreCardProps) {
  const getSEOScoreDescription = (score: number): string => {
    if (score >= 90) return 'Excellent SEO performance!'
    if (score >= 80) return 'Good SEO performance with minor improvements needed'
    if (score >= 70) return 'Average SEO performance, several areas need attention'
    if (score >= 60) return 'Below average SEO performance, significant improvements needed'
    if (score >= 50) return 'Poor SEO performance, major improvements required'
    return 'Critical SEO issues, immediate action required'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="h-5 w-5 mr-2" />
          SEO Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {seoScore?.score || 0}
          </div>
          <div className="text-lg font-semibold text-gray-600 mb-2">
            Grade: {seoScore?.grade || 'F'}
          </div>
          <Progress value={seoScore?.score || 0} className="mb-4" />
          <p className="text-sm text-gray-600">
            {getSEOScoreDescription(seoScore?.score || 0)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
