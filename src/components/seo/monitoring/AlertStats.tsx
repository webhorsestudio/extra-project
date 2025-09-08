/**
 * Alert Statistics Component
 * Statistics overview for alerts
 */

import { Card, CardContent } from '@/components/ui/card'
// import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, Clock, X } from 'lucide-react'

interface AlertStatsProps {
  totalAlerts: number
  activeAlerts: number
  acknowledgedAlerts: number
  resolvedAlerts: number
}

export function AlertStats({ 
  totalAlerts, 
  activeAlerts, 
  acknowledgedAlerts, 
  resolvedAlerts 
}: AlertStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold">{totalAlerts}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-red-600">{activeAlerts}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-yellow-500" />
            <div>
              <p className="text-sm font-medium text-gray-600">Acknowledged</p>
              <p className="text-2xl font-bold text-yellow-600">{acknowledgedAlerts}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <X className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{resolvedAlerts}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
