'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Globe } from 'lucide-react'

interface BasicSEOSettingsProps {
  data: Record<string, unknown>
  onChange: (field: string, value: unknown) => void
}

export function BasicSEOSettings({ data, onChange }: BasicSEOSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Basic SEO Settings
        </CardTitle>
        <CardDescription>
          Configure your website&apos;s basic SEO information and metadata.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Site Name</Label>
            <Input
              id="siteName"
              value={String(data.siteName || '')}
              onChange={(e) => onChange('siteName', e.target.value)}
              placeholder="Your Website Name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="siteUrl">Site URL</Label>
            <Input
              id="siteUrl"
              value={String(data.siteUrl || '')}
              onChange={(e) => onChange('siteUrl', e.target.value)}
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="siteDescription">Site Description</Label>
          <Textarea
            id="siteDescription"
            value={String(data.siteDescription || '')}
            onChange={(e) => onChange('siteDescription', e.target.value)}
            placeholder="Brief description of your website"
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="siteKeywords">Keywords</Label>
          <Input
            id="siteKeywords"
            value={String(data.siteKeywords || '')}
            onChange={(e) => onChange('siteKeywords', e.target.value)}
            placeholder="keyword1, keyword2, keyword3"
          />
          <p className="text-sm text-gray-500">Separate keywords with commas</p>
        </div>
      </CardContent>
    </Card>
  )
}
