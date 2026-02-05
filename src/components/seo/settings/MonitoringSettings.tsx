'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Monitor } from 'lucide-react'

interface MonitoringSettingsProps {
  data: Record<string, unknown>
  onChange: (field: string, value: unknown) => void
}

export function MonitoringSettings({ data, onChange }: MonitoringSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="w-5 h-5" />
          Monitoring & Alerts
        </CardTitle>
        <CardDescription>
          Configure SEO monitoring and alert notifications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable SEO Monitoring</Label>
              <p className="text-sm text-gray-500">Real-time SEO health monitoring</p>
            </div>
            <Switch
              checked={Boolean(data.enableSEOMonitoring ?? true)}
              onCheckedChange={(checked) => onChange('enableSEOMonitoring', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Alerts</Label>
              <p className="text-sm text-gray-500">Email notifications for SEO issues</p>
            </div>
            <Switch
              checked={Boolean(data.enableAlerts ?? true)}
              onCheckedChange={(checked) => onChange('enableAlerts', checked)}
            />
          </div>
          
          {Boolean(data.enableAlerts) && (
            <div className="space-y-2">
              <Label htmlFor="alertEmail">Alert Email</Label>
              <Input
                id="alertEmail"
                type="email"
                value={String(data.alertEmail || '')}
                onChange={(e) => onChange('alertEmail', e.target.value)}
                placeholder="admin@yourwebsite.com"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
