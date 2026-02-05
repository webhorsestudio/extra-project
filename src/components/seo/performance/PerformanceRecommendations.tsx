/**
 * Performance Recommendations Component
 * List of performance recommendations with icons and badges
 */

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Info, CheckCircle } from 'lucide-react'

interface Recommendation {
  type: 'error' | 'warning' | 'info'
  category: string
  message: string
  suggestion: string
  impact: 'high' | 'medium' | 'low'
}

interface PerformanceRecommendationsProps {
  recommendations?: Recommendation[]
}

export function PerformanceRecommendations({ recommendations }: PerformanceRecommendationsProps) {
  const safeRecommendations = recommendations || []
  
  if (safeRecommendations.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Great Performance!</h3>
          <p className="text-gray-600">No performance recommendations at this time.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {safeRecommendations.map((rec, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {rec.type === 'error' ? (
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
              ) : rec.type === 'warning' ? (
                <Info className="w-5 h-5 text-yellow-500 mt-0.5" />
              ) : (
                <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900">{rec.message}</h4>
                  <Badge variant="outline" className="capitalize">
                    {rec.impact}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{rec.suggestion}</p>
                <div className="mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {rec.category}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
