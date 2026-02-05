/**
 * SEO Performance Component (Refactored)
 * Main performance monitoring component using smaller sub-components
 */

'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PerformanceHeader } from './PerformanceHeader'
import { PerformanceScoresGrid } from './PerformanceScoresGrid'
import { PageSpeedOverview } from './PageSpeedOverview'
import { MobileUsabilityCard } from './MobileUsabilityCard'
import { CoreWebVitalsOverview } from './CoreWebVitalsOverview'
import { PerformanceRecommendations } from './PerformanceRecommendations'
import { PerformanceLoadingSkeleton } from './PerformanceLoadingSkeleton'
import { PerformanceEmptyState } from './PerformanceEmptyState'

interface Recommendation {
  type: 'error' | 'warning' | 'info'
  category: string
  message: string
  suggestion: string
  impact: 'high' | 'medium' | 'low'
}

interface PerformanceData {
  scores?: {
    overall: number
    pageSpeed: number
    coreWebVitals: number
    mobileUsability: number
  }
  current?: {
    pageSpeed?: {
      desktop: number
      mobile: number
    }
    mobileUsability?: number
    coreWebVitals?: {
      lcp: number
      fid: number
      cls: number
      fcp: number
      ttfb: number
    }
  }
  recommendations?: Recommendation[]
  [key: string]: unknown
}

interface SEOPerformanceRefactoredProps {
  className?: string
}

export function SEOPerformanceRefactored({ className = '' }: SEOPerformanceRefactoredProps) {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [period, setPeriod] = useState('30d')

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/seo/performance?period=${period}`)
        if (response.ok) {
          const result = await response.json()
          setPerformanceData(result.data as PerformanceData)
        }
      } catch (error) {
        console.error('Error fetching performance data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPerformance()
  }, [period])

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <PerformanceHeader period={period} onPeriodChange={setPeriod} />
        <PerformanceLoadingSkeleton />
      </div>
    )
  }

  if (!performanceData) {
    return (
      <div className={`space-y-6 ${className}`}>
        <PerformanceHeader period={period} onPeriodChange={setPeriod} />
        <PerformanceEmptyState />
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <PerformanceHeader period={period} onPeriodChange={setPeriod} />

      {/* Performance Scores */}
      <PerformanceScoresGrid scores={performanceData.scores || { overall: 0, pageSpeed: 0, coreWebVitals: 0, mobileUsability: 0 }} />

      {/* Detailed Performance */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="core-web-vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PageSpeedOverview pageSpeed={performanceData.current?.pageSpeed} />
            <MobileUsabilityCard score={performanceData.current?.mobileUsability} />
          </div>
        </TabsContent>

        <TabsContent value="core-web-vitals" className="space-y-6">
          <CoreWebVitalsOverview coreWebVitals={performanceData.current?.coreWebVitals} />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <PerformanceRecommendations recommendations={performanceData.recommendations} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
