/**
 * Alert List Component
 * List of alerts with loading and empty states
 */

import { AlertCard } from './AlertCard'
import { AlertEmptyState } from './AlertEmptyState'
import { AlertLoadingSkeleton } from './AlertLoadingSkeleton'

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

interface AlertListProps {
  alerts: Alert[]
  loading: boolean
  onAcknowledge: (alertId: string) => void
  onResolve: (alertId: string) => void
  className?: string
}

export function AlertList({ alerts, loading, onAcknowledge, onResolve, className = '' }: AlertListProps) {
  if (loading) {
    return <AlertLoadingSkeleton className={className} />
  }

  if (alerts.length === 0) {
    return <AlertEmptyState className={className} />
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {alerts.map((alert) => (
        <AlertCard
          key={alert.id}
          alert={alert}
          onAcknowledge={onAcknowledge}
          onResolve={onResolve}
        />
      ))}
    </div>
  )
}
