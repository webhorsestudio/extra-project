'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CreatePopupAdData } from '@/types/popup-ad'
import { Calendar } from 'lucide-react'

interface SchedulingSectionProps {
  formData: CreatePopupAdData
  onInputChange: (field: string, value: string | number | boolean | string[] | Record<string, unknown>) => void
}

export default function SchedulingSection({ formData, onInputChange }: SchedulingSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Scheduling
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            id="start_date"
            type="datetime-local"
            value={formData.start_date || ''}
            onChange={(e) => onInputChange('start_date', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">End Date</Label>
          <Input
            id="end_date"
            type="datetime-local"
            value={formData.end_date || ''}
            onChange={(e) => onInputChange('end_date', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
