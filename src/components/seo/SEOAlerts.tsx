'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X,
  Clock,
  // Mail
} from 'lucide-react'
import { toast } from 'sonner'

interface SEOAlert {
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

interface SEOAlertsProps {
  className?: string
}

export function SEOAlerts({ className = '' }: SEOAlertsProps) {
  const [alerts, setAlerts] = useState<SEOAlert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch('/api/seo/alerts?status=active&limit=10')
        if (response.ok) {
          const result = await response.json()
          setAlerts(result.data || [])
        }
      } catch (error) {
        console.error('Error fetching SEO alerts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
  }, [])

  const handleAcknowledge = async (alertId: string) => {
    try {
      const response = await fetch('/api/seo/alerts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: alertId,
          status: 'acknowledged',
        }),
      })

      if (response.ok) {
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, status: 'acknowledged', acknowledged_at: new Date().toISOString() }
            : alert
        ))
        toast.success('Alert acknowledged')
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error)
      toast.error('Failed to acknowledge alert')
    }
  }

  const handleResolve = async (alertId: string) => {
    try {
      const response = await fetch('/api/seo/alerts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: alertId,
          status: 'resolved',
        }),
      })

      if (response.ok) {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId))
        toast.success('Alert resolved')
      }
    } catch (error) {
      console.error('Error resolving alert:', error)
      toast.error('Failed to resolve alert')
    }
  }

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

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (alerts.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">All Good!</h3>
        <p className="text-gray-600">No active SEO alerts at the moment.</p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {alerts.map((alert) => (
        <Card key={alert.id} className="border-l-4 border-l-orange-500">
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
                      onClick={() => handleAcknowledge(alert.id)}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Acknowledge
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResolve(alert.id)}
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
      ))}
    </div>
  )
}
