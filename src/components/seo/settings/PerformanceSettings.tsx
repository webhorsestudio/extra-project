'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Zap } from 'lucide-react'

interface PerformanceSettingsProps {
  data: Record<string, unknown>
  onChange: (field: string, value: unknown) => void
}

export function PerformanceSettings({ data, onChange }: PerformanceSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Performance Settings
        </CardTitle>
        <CardDescription>
          Configure performance optimization features for better Core Web Vitals.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Web Vitals Monitoring</Label>
              <p className="text-sm text-gray-500">Track Core Web Vitals performance metrics</p>
            </div>
            <Switch
              checked={Boolean(data.enableWebVitals ?? true)}
              onCheckedChange={(checked) => onChange('enableWebVitals', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Resource Hints</Label>
              <p className="text-sm text-gray-500">Add preload, prefetch, and preconnect hints</p>
            </div>
            <Switch
              checked={Boolean(data.enableResourceHints ?? true)}
              onCheckedChange={(checked) => onChange('enableResourceHints', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Critical CSS</Label>
              <p className="text-sm text-gray-500">Inline critical CSS for faster rendering</p>
            </div>
            <Switch
              checked={Boolean(data.enableCriticalCSS ?? true)}
              onCheckedChange={(checked) => onChange('enableCriticalCSS', checked)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
