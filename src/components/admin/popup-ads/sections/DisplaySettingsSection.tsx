'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CreatePopupAdData } from '@/types/popup-ad'
import { Settings } from 'lucide-react'

interface DisplaySettingsSectionProps {
  formData: CreatePopupAdData
  onInputChange: (field: string, value: string | number | boolean | string[] | Record<string, unknown>) => void
}

export default function DisplaySettingsSection({ formData, onInputChange }: DisplaySettingsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Display Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="display_delay">Display Delay (seconds)</Label>
            <Input
              id="display_delay"
              type="number"
              value={formData.display_delay || 0}
              onChange={(e) => onInputChange('display_delay', parseInt(e.target.value) || 0)}
              placeholder="0"
              min="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="display_duration">Display Duration (seconds)</Label>
            <Input
              id="display_duration"
              type="number"
              value={formData.display_duration || 0}
              onChange={(e) => onInputChange('display_duration', parseInt(e.target.value) || 0)}
              placeholder="0 (until dismissed)"
              min="0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_display_count">Max Display Count</Label>
          <Input
            id="max_display_count"
            type="number"
            value={formData.max_display_count || 0}
            onChange={(e) => onInputChange('max_display_count', parseInt(e.target.value) || 0)}
            placeholder="0 (unlimited)"
            min="0"
          />
        </div>
      </CardContent>
    </Card>
  )
}
