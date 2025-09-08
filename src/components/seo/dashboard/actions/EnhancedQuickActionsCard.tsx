'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SEOAuditButton } from './SEOAuditButton'

interface EnhancedQuickActionsCardProps {
  className?: string
}

export function EnhancedQuickActionsCard({ className = '' }: EnhancedQuickActionsCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <p className="text-sm text-gray-600">
          Perform common SEO tasks quickly
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <SEOAuditButton />
      </CardContent>
    </Card>
  )
}
