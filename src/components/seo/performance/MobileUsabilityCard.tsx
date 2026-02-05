/**
 * Mobile Usability Card Component
 * Mobile usability score display
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface MobileUsabilityCardProps {
  score?: number
}

export function MobileUsabilityCard({ score }: MobileUsabilityCardProps) {
  const safeScore = score || 0
  
  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 70) return 'Good'
    if (score >= 50) return 'Needs Improvement'
    return 'Poor'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mobile Usability</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {safeScore}
          </div>
          <div className="text-sm text-gray-600 mb-4">Mobile Usability Score</div>
          <Progress value={safeScore} className="mb-4" />
          <Badge variant="outline">
            {getScoreBadge(safeScore)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
