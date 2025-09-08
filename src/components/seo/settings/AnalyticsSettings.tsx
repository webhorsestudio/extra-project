'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { BarChart3, CheckCircle, AlertTriangle, TestTube } from 'lucide-react'
import { toast } from 'sonner'

interface AnalyticsSettingsProps {
  data: Record<string, unknown>
  onChange: (field: string, value: unknown) => void
}

export function AnalyticsSettings({ data, onChange }: AnalyticsSettingsProps) {
  const [testResults, setTestResults] = useState<Record<string, 'success' | 'error' | 'pending'>>({})

  const testConnection = async (type: string) => {
    setTestResults(prev => ({ ...prev, [type]: 'pending' }))
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock test results
      const success = Math.random() > 0.3 // 70% success rate for demo
      setTestResults(prev => ({ ...prev, [type]: success ? 'success' : 'error' }))
      
      if (success) {
        toast.success(`${type} connection test successful!`)
      } else {
        toast.error(`${type} connection test failed!`)
      }
    } catch {
      setTestResults(prev => ({ ...prev, [type]: 'error' }))
      toast.error(`${type} connection test failed!`)
    }
  }

  const getTestResultIcon = (type: string) => {
    const result = testResults[type]
    if (result === 'pending') return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    if (result === 'success') return <CheckCircle className="w-4 h-4 text-green-500" />
    if (result === 'error') return <AlertTriangle className="w-4 h-4 text-red-500" />
    return <TestTube className="w-4 h-4 text-gray-400" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Analytics & Tracking
        </CardTitle>
        <CardDescription>
          Configure Google Analytics, Search Console, and other tracking services.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
            <div className="flex gap-2">
              <Input
                id="googleAnalyticsId"
                value={String(data.googleAnalyticsId || '')}
                onChange={(e) => onChange('googleAnalyticsId', e.target.value)}
                placeholder="G-XXXXXXXXXX"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => testConnection('Google Analytics')}
                disabled={!data.googleAnalyticsId}
              >
                {getTestResultIcon('Google Analytics')}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="googleSearchConsoleId">Google Search Console</Label>
            <div className="flex gap-2">
              <Input
                id="googleSearchConsoleId"
                value={String(data.googleSearchConsoleId || '')}
                onChange={(e) => onChange('googleSearchConsoleId', e.target.value)}
                placeholder="Search Console Property"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => testConnection('Search Console')}
                disabled={!data.googleSearchConsoleId}
              >
                {getTestResultIcon('Search Console')}
              </Button>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="googleTagManagerId">Google Tag Manager ID</Label>
          <div className="flex gap-2">
            <Input
              id="googleTagManagerId"
              value={String(data.googleTagManagerId || '')}
              onChange={(e) => onChange('googleTagManagerId', e.target.value)}
              placeholder="GTM-XXXXXXX"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => testConnection('Tag Manager')}
              disabled={!data.googleTagManagerId}
            >
              {getTestResultIcon('Tag Manager')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
