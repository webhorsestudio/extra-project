'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Zap } from 'lucide-react'

interface PerformanceTabProps {
  data: {
    performance?: {
      coreWebVitals?: {
        lcp: number
        fid: number
        cls: number
      }
      pageSpeed?: number
      mobileUsability?: number
    }
    [key: string]: unknown
  }
}

export function PerformanceTab({ data }: PerformanceTabProps) {
  // Safely extract performance data
  const performance = data.performance || {}
  const coreWebVitals = performance.coreWebVitals || { lcp: 0, fid: 0, cls: 0 }
  return (
    <div className="space-y-6">
      {/* Core Web Vitals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Core Web Vitals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {coreWebVitals.lcp}s
              </div>
              <p className="text-sm text-gray-600">LCP</p>
              <Badge variant="secondary" className="mt-1">Good</Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {coreWebVitals.fid}ms
              </div>
              <p className="text-sm text-gray-600">FID</p>
              <Badge variant="secondary" className="mt-1">Good</Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {coreWebVitals.cls}
              </div>
              <p className="text-sm text-gray-600">CLS</p>
              <Badge variant="secondary" className="mt-1">Good</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Page Speed */}
      <Card>
        <CardHeader>
          <CardTitle>Page Speed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {performance.pageSpeed || 0}
              </div>
              <p className="text-sm text-gray-600">Desktop</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {performance.mobileUsability || 0}
              </div>
              <p className="text-sm text-gray-600">Mobile</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
