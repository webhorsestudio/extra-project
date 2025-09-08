'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Target } from 'lucide-react'

interface SocialMediaSettingsProps {
  data: Record<string, unknown>
  onChange: (field: string, value: unknown) => void
}

export function SocialMediaSettings({ data, onChange }: SocialMediaSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Social Media
        </CardTitle>
        <CardDescription>
          Configure social media profiles for better social sharing and SEO.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="facebookAppId">Facebook App ID</Label>
            <Input
              id="facebookAppId"
              value={String(data.facebookAppId || '')}
              onChange={(e) => onChange('facebookAppId', e.target.value)}
              placeholder="123456789012345"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twitterHandle">Twitter Handle</Label>
            <Input
              id="twitterHandle"
              value={String(data.twitterHandle || '')}
              onChange={(e) => onChange('twitterHandle', e.target.value)}
              placeholder="@yourhandle"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
          <Input
            id="linkedinUrl"
            value={String(data.linkedinUrl || '')}
            onChange={(e) => onChange('linkedinUrl', e.target.value)}
            placeholder="https://linkedin.com/company/yourcompany"
          />
        </div>
      </CardContent>
    </Card>
  )
}
