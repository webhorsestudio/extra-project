'use client'

import { useState } from 'react'
import { SEOScoreCard } from '../SEOScoreCard'
import { SuperQuickActionsCard } from '../actions/SuperQuickActionsCard'

interface OverviewTabProps {
  data: {
    overview?: {
      seoScore?: {
        score: number
        grade: string
        breakdown: Record<string, unknown>
      }
    }
    [key: string]: unknown
  }
}

export function OverviewTab({ data }: OverviewTabProps) {
  const [, setAuditResult] = useState<Record<string, unknown> | null>(null)

  const handleAuditComplete = (result: Record<string, unknown>) => {
    setAuditResult(result)
    // You could trigger a dashboard refresh here if needed
    // window.location.reload()
  }

  // Safely extract overview data
  const overview = data.overview || {}
  const seoScore = overview.seoScore

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SEOScoreCard seoScore={seoScore} />
      <SuperQuickActionsCard onAuditComplete={handleAuditComplete} />
    </div>
  )
}
