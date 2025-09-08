'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Search } from 'lucide-react'

interface AdvancedSettingsProps {
  data: Record<string, unknown>
  onChange: (field: string, value: unknown) => void
}

export function AdvancedSettings({ data, onChange }: AdvancedSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Advanced Settings
        </CardTitle>
        <CardDescription>
          Configure advanced SEO features and custom configurations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Structured Data</Label>
              <p className="text-sm text-gray-500">Generate JSON-LD structured data</p>
            </div>
            <Switch
              checked={Boolean(data.enableStructuredData ?? true)}
              onCheckedChange={(checked) => onChange('enableStructuredData', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Sitemap</Label>
              <p className="text-sm text-gray-500">Generate XML sitemap automatically</p>
            </div>
            <Switch
              checked={Boolean(data.enableSitemap ?? true)}
              onCheckedChange={(checked) => onChange('enableSitemap', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Robots.txt</Label>
              <p className="text-sm text-gray-500">Generate robots.txt automatically</p>
            </div>
            <Switch
              checked={Boolean(data.enableRobotsTxt ?? true)}
              onCheckedChange={(checked) => onChange('enableRobotsTxt', checked)}
            />
          </div>
          
          {Boolean(data.enableRobotsTxt) && (
            <div className="space-y-2">
              <Label htmlFor="customRobotsTxt">Custom Robots.txt</Label>
              <Textarea
                id="customRobotsTxt"
                value={String(data.customRobotsTxt || '')}
                onChange={(e) => onChange('customRobotsTxt', e.target.value)}
                placeholder="User-agent: *&#10;Allow: /&#10;Disallow: /admin/"
                rows={6}
              />
              <p className="text-sm text-gray-500">Leave empty to use default robots.txt</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
