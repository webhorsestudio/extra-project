'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Target, Zap, BookOpen } from 'lucide-react'

interface SEOAuditRecommendationsProps {
  recommendations: Array<{
    category: string
    title: string
    description: string
    impact: 'high' | 'medium' | 'low'
    effort: 'low' | 'medium' | 'high'
  }>
}

export function SEOAuditRecommendations({ recommendations }: SEOAuditRecommendationsProps) {
  const getPriorityIcon = (impact: string) => {
    switch (impact) {
      case 'high':
        return <TrendingUp className="h-5 w-5 text-red-500" />
      case 'medium':
        return <TrendingUp className="h-5 w-5 text-yellow-500" />
      default:
        return <TrendingUp className="h-5 w-5 text-blue-500" />
    }
  }

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return <Badge variant="destructive">High Impact</Badge>
      case 'medium':
        return <Badge variant="default">Medium Impact</Badge>
      default:
        return <Badge variant="secondary">Low Impact</Badge>
    }
  }

  const getEffortBadge = (effort: string) => {
    switch (effort) {
      case 'low':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Low Effort</Badge>
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Medium Effort</Badge>
      default:
        return <Badge variant="outline" className="bg-red-50 text-red-700">High Effort</Badge>
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'title optimization':
        return <Target className="h-4 w-4" />
      case 'meta description':
        return <BookOpen className="h-4 w-4" />
      case 'image optimization':
        return <Zap className="h-4 w-4" />
      case 'internal linking':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Target className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>SEO Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Recommendations Needed!</h3>
                <p className="text-gray-600">Your page is already well optimized for SEO.</p>
              </div>
            ) : (
              recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    {getPriorityIcon(rec.impact)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(rec.category)}
                        <h4 className="font-medium text-gray-900">{rec.title}</h4>
                      </div>
                      <div className="flex gap-2">
                        {getImpactBadge(rec.impact)}
                        {getEffortBadge(rec.effort)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                    <Badge variant="outline" className="text-xs">{rec.category}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg bg-blue-50">
                <h4 className="font-medium text-blue-900 mb-2">High Impact, Low Effort</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Focus on these recommendations first for maximum SEO improvement with minimal effort.
                </p>
                <div className="space-y-1">
                  {recommendations
                    .filter(r => r.impact === 'high' && r.effort === 'low')
                    .map((rec, index) => (
                      <div key={index} className="text-sm text-blue-800">• {rec.title}</div>
                    ))}
                </div>
              </div>
              
              <div className="p-4 border rounded-lg bg-yellow-50">
                <h4 className="font-medium text-yellow-900 mb-2">Medium Priority</h4>
                <p className="text-sm text-yellow-700 mb-3">
                  These recommendations provide good value and should be addressed next.
                </p>
                <div className="space-y-1">
                  {recommendations
                    .filter(r => r.impact === 'medium')
                    .map((rec, index) => (
                      <div key={index} className="text-sm text-yellow-800">• {rec.title}</div>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
