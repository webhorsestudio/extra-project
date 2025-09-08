/**
 * Monitoring Status Card Component
 * Status indicators for monitoring and alerts
 */

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Monitor, Bell } from 'lucide-react'

interface MonitoringStatusCardProps {
  monitoringEnabled: boolean
  alertsEnabled: boolean
  alertEmail?: string
}

export function MonitoringStatusCard({ 
  monitoringEnabled, 
  alertsEnabled, 
  alertEmail 
}: MonitoringStatusCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Monitor className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-medium">Real-time Monitoring</h3>
              <p className="text-sm text-gray-600 mb-2">Continuous SEO health monitoring</p>
              <Badge 
                variant={monitoringEnabled ? "default" : "secondary"}
                className={monitoringEnabled ? "bg-green-100 text-green-800" : ""}
              >
                {monitoringEnabled ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-orange-600" />
            <div>
              <h3 className="font-medium">Alert System</h3>
              <p className="text-sm text-gray-600 mb-2">Automated SEO issue notifications</p>
              <div className="space-y-1">
                <Badge 
                  variant={alertsEnabled ? "default" : "secondary"}
                  className={alertsEnabled ? "bg-green-100 text-green-800" : ""}
                >
                  {alertsEnabled ? "Configured" : "Disabled"}
                </Badge>
                {alertsEnabled && alertEmail && (
                  <p className="text-xs text-gray-500">Email: {alertEmail}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
