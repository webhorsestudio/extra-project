/**
 * SEO Monitoring Component (Refactored)
 * Main monitoring component using smaller sub-components
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Monitor } from 'lucide-react'
import { toast } from 'sonner'
import { AlertList } from './AlertList'
import { MonitoringStatusCard } from './MonitoringStatusCard'
import { AlertStats } from './AlertStats'

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

interface SEOMonitoringRefactoredProps {
  className?: string
}

export function SEOMonitoringRefactored({ className = '' }: SEOMonitoringRefactoredProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [monitoringEnabled] = useState(true)
  const [alertsEnabled] = useState(true)
  const [alertEmail] = useState('admin@yourwebsite.com')

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

  // Calculate alert statistics
  const totalAlerts = alerts.length
  const activeAlerts = alerts.filter(alert => alert.status === 'active').length
  const acknowledgedAlerts = alerts.filter(alert => alert.status === 'acknowledged').length
  const resolvedAlerts = alerts.filter(alert => alert.status === 'resolved').length

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            SEO Monitoring & Alerts
          </CardTitle>
          <CardDescription>
            Real-time SEO monitoring, alerts, and issue tracking.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MonitoringStatusCard
            monitoringEnabled={monitoringEnabled}
            alertsEnabled={alertsEnabled}
            alertEmail={alertEmail}
          />
        </CardContent>
      </Card>

      {/* Alert Statistics */}
      <AlertStats
        totalAlerts={totalAlerts}
        activeAlerts={activeAlerts}
        acknowledgedAlerts={acknowledgedAlerts}
        resolvedAlerts={resolvedAlerts}
      />

      {/* Active Alerts */}
      <div>
        <h3 className="font-medium mb-4">Active Alerts</h3>
        <AlertList
          alerts={alerts}
          loading={loading}
          onAcknowledge={handleAcknowledge}
          onResolve={handleResolve}
        />
      </div>

      {/* Information Card */}
      <Card className="p-4 border rounded-lg bg-blue-50">
        <div className="flex items-start gap-3">
          <Monitor className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Monitoring Information</h4>
            <p className="text-sm text-blue-700 mt-1">
              SEO monitoring runs continuously in the background, checking your site&apos;s performance, 
              rankings, and technical health. Alerts are generated when issues are detected that 
              require your attention.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
