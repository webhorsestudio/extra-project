'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AdvancedSEOAuditButton } from './AdvancedSEOAuditButton'

interface SuperQuickActionsCardProps {
  className?: string
  onAuditComplete?: (result: Record<string, unknown>) => void
}

export function SuperQuickActionsCard({ 
  className = '', 
  onAuditComplete 
}: SuperQuickActionsCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <p className="text-sm text-gray-600">
          Run comprehensive SEO audits with detailed results
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <AdvancedSEOAuditButton onAuditComplete={onAuditComplete} />
      </CardContent>
    </Card>
  )
}
