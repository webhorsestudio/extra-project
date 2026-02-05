'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { CreatePopupAdData } from '@/types/popup-ad'
import { Monitor, Smartphone, Tablet, Zap } from 'lucide-react'

interface PlatformSettingsSectionProps {
  formData: CreatePopupAdData
  onInputChange: (field: string, value: string | number | boolean | string[] | Record<string, unknown>) => void
}

export default function PlatformSettingsSection({ formData, onInputChange }: PlatformSettingsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Platform Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            <Label htmlFor="show_on_mobile">Show on Mobile</Label>
          </div>
          <Switch
            id="show_on_mobile"
            checked={formData.show_on_mobile}
            onCheckedChange={(checked) => onInputChange('show_on_mobile', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            <Label htmlFor="show_on_desktop">Show on Desktop</Label>
          </div>
          <Switch
            id="show_on_desktop"
            checked={formData.show_on_desktop}
            onCheckedChange={(checked) => onInputChange('show_on_desktop', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tablet className="h-4 w-4" />
            <Label htmlFor="show_on_tablet">Show on Tablet</Label>
          </div>
          <Switch
            id="show_on_tablet"
            checked={formData.show_on_tablet}
            onCheckedChange={(checked) => onInputChange('show_on_tablet', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <Label htmlFor="is_active">Active</Label>
          </div>
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => onInputChange('is_active', checked)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
