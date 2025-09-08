'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TestTube, RefreshCw } from 'lucide-react'

interface SEOTestFormProps {
  testUrl: string
  setTestUrl: (url: string) => void
  onRunTests: () => void
  isRunning: boolean
}

export function SEOTestForm({ testUrl, setTestUrl, onRunTests, isRunning }: SEOTestFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          SEO Testing Tools
        </CardTitle>
        <CardDescription>
          Test your website&apos;s SEO performance, structured data, and Core Web Vitals.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="testUrl">Website URL</Label>
          <div className="flex gap-2">
            <Input
              id="testUrl"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="https://yourwebsite.com"
              className="flex-1"
            />
            <Button 
              onClick={onRunTests} 
              disabled={isRunning || !testUrl}
              className="min-w-32"
            >
              {isRunning ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Testing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <TestTube className="w-4 h-4" />
                  Run Tests
                </div>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
