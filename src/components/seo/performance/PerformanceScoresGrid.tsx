/**
 * Performance Scores Grid Component
 * Grid of performance score cards
 */

import { BarChart3, Zap, Target, Smartphone } from 'lucide-react'
import { PerformanceScoreCard } from './PerformanceScoreCard'

interface PerformanceScoresGridProps {
  scores: {
    overall: number
    pageSpeed: number
    coreWebVitals: number
    mobileUsability: number
  }
}

export function PerformanceScoresGrid({ scores }: PerformanceScoresGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <PerformanceScoreCard
        title="Overall Score"
        score={scores.overall}
        icon={BarChart3}
        iconColor="text-blue-600"
      />
      <PerformanceScoreCard
        title="Page Speed"
        score={scores.pageSpeed}
        icon={Zap}
        iconColor="text-yellow-600"
      />
      <PerformanceScoreCard
        title="Core Web Vitals"
        score={scores.coreWebVitals}
        icon={Target}
        iconColor="text-green-600"
      />
      <PerformanceScoreCard
        title="Mobile Usability"
        score={scores.mobileUsability}
        icon={Smartphone}
        iconColor="text-purple-600"
      />
    </div>
  )
}
