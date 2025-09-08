/**
 * Recommendations List Component
 * Displays validation recommendations
 */

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertTriangle, Info } from 'lucide-react'
import { ValidationRecommendation } from '@/lib/seo/structured-data/types'

interface RecommendationsListProps {
  recommendations: ValidationRecommendation[]
}

export function RecommendationsList({ recommendations }: RecommendationsListProps) {
  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'warning':
        return <Info className="w-4 h-4 text-yellow-500" />
      case 'info':
        return <CheckCircle className="w-4 h-4 text-blue-500" />
      default:
        return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">All Good!</h3>
          <p className="text-gray-600">No recommendations at this time.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {recommendations.map((rec, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {getRecommendationIcon(rec.type)}
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{rec.message}</h4>
                <p className="text-sm text-gray-600 mt-1">{rec.suggestion}</p>
              </div>
              <Badge variant="outline" className="capitalize">
                {rec.type}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
