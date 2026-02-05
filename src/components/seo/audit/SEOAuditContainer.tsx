'use client'

import { useState } from 'react'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Search, Target } from 'lucide-react'
import { SEOAuditForm } from './SEOAuditForm'
import { SEOAuditResults } from './SEOAuditResults'
import { SEOAuditScore } from './SEOAuditScore'

interface SEOAuditResult {
  score: number
  summary: {
    totalIssues: number
    highPriorityIssues: number
    mediumPriorityIssues: number
    lowPriorityIssues: number
    totalRecommendations: number
  }
  issues: Array<{
    type: 'error' | 'warning' | 'info'
    category: string
    message: string
    suggestion: string
    priority: 'high' | 'medium' | 'low'
  }>
  recommendations: Array<{
    category: string
    title: string
    description: string
    impact: 'high' | 'medium' | 'low'
    effort: 'low' | 'medium' | 'high'
  }>
}

interface SEOAuditContainerProps {
  className?: string
}

export function SEOAuditContainer({ className = '' }: SEOAuditContainerProps) {
  const [auditResult, setAuditResult] = useState<SEOAuditResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAuditComplete = (result: Record<string, unknown>) => {
    // Safely convert the result to our expected type
    const summary = result.summary as Record<string, unknown> || {}
    const safeResult: SEOAuditResult = {
      score: (result.score as number) || 0,
      summary: {
        totalIssues: (summary.totalIssues as number) || 0,
        highPriorityIssues: (summary.highPriorityIssues as number) || 0,
        mediumPriorityIssues: (summary.mediumPriorityIssues as number) || 0,
        lowPriorityIssues: (summary.lowPriorityIssues as number) || 0,
        totalRecommendations: (summary.totalRecommendations as number) || 0,
      },
      issues: (result.issues as Array<{
        type: 'error' | 'warning' | 'info'
        category: string
        message: string
        suggestion: string
        priority: 'high' | 'medium' | 'low'
      }>) || [],
      recommendations: (result.recommendations as Array<{
        category: string
        title: string
        description: string
        impact: 'high' | 'medium' | 'low'
        effort: 'low' | 'medium' | 'high'
      }>) || []
    }
    setAuditResult(safeResult)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">SEO Audit</h2>
          <p className="text-gray-600 mt-1">Analyze your page&apos;s SEO performance</p>
        </div>
      </div>

      {/* Audit Form */}
      <SEOAuditForm 
        onAuditComplete={handleAuditComplete}
        loading={loading}
        setLoading={setLoading}
      />

      {/* Audit Score */}
      {auditResult && (
        <SEOAuditScore 
          score={auditResult.score}
          summary={auditResult.summary}
        />
      )}

      {/* Audit Results */}
      {auditResult && (
        <SEOAuditResults auditResult={auditResult} />
      )}
    </div>
  )
}
