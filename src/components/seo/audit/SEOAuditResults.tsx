'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SEOAuditIssues } from './SEOAuditIssues'
import { SEOAuditContent } from './SEOAuditContent'
import { SEOAuditTechnical } from './SEOAuditTechnical'
import { SEOAuditRecommendations } from './SEOAuditRecommendations'

interface SEOAuditResultsProps {
  auditResult: {
    score: number
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
    summary: {
      totalIssues: number
      highPriorityIssues: number
      mediumPriorityIssues: number
      lowPriorityIssues: number
      totalRecommendations: number
    }
  }
}

export function SEOAuditResults({ auditResult }: SEOAuditResultsProps) {
  return (
    <Tabs defaultValue="issues" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="issues">Issues</TabsTrigger>
        <TabsTrigger value="content">Content</TabsTrigger>
        <TabsTrigger value="technical">Technical</TabsTrigger>
        <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
      </TabsList>

      <TabsContent value="issues" className="space-y-6">
        <SEOAuditIssues issues={auditResult.issues} />
      </TabsContent>

      <TabsContent value="content" className="space-y-6">
        <SEOAuditContent auditResult={auditResult} />
      </TabsContent>

      <TabsContent value="technical" className="space-y-6">
        <SEOAuditTechnical auditResult={auditResult} />
      </TabsContent>

      <TabsContent value="recommendations" className="space-y-6">
        <SEOAuditRecommendations recommendations={auditResult.recommendations} />
      </TabsContent>
    </Tabs>
  )
}
