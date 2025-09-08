/**
 * Alert Card Component
 * Individual alert display with actions
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle, Info, X, Clock } from 'lucide-react'

interface Alert {
  id: string
  alert_type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  url?: string
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed'
  created_at: string
  acknowledged_at?: string
  resolved_at?: string
}

interface AlertCardProps {
  alert: Alert
  onAcknowledge: (alertId: string) => void
  onResolve: (alertId: string) => void
}

export function AlertCard({ alert, onAcknowledge, onResolve }: AlertCardProps) {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
      case 'medium':
        return <Info className="w-4 h-4 text-yellow-500" />
      case 'low':
        return <Info className="w-4 h-4 text-blue-500" />
      default:
        return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  const getSeverityBadge = (severity: string) => {
    const variants = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'secondary',
      low: 'outline'
    } as const

    return (
      <Badge variant={variants[severity as keyof typeof variants] || 'outline'}>
        {severity.toUpperCase()}
      </Badge>
    )
  }

  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getSeverityIcon(alert.severity)}
            <CardTitle className="text-sm font-medium">{alert.title}</CardTitle>
            {getSeverityBadge(alert.severity)}
          </div>
          <div className="flex gap-2">
            {alert.status === 'active' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAcknowledge(alert.id)}
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Acknowledge
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onResolve(alert.id)}
                >
                  <X className="w-3 h-3 mr-1" />
                  Resolve
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="mb-3">{alert.message}</CardDescription>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(alert.created_at).toLocaleDateString()}
          </div>
          {alert.url && (
            <div className="flex items-center gap-1">
              <span>URL:</span>
              <code className="bg-gray-100 px-1 rounded text-xs">{alert.url}</code>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
