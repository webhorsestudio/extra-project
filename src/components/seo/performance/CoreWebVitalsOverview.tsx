/**
 * Core Web Vitals Overview Component
 * Core Web Vitals metrics with status indicators
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface CoreWebVitalsOverviewProps {
  coreWebVitals?: {
    lcp: number
    fid: number
    cls: number
    fcp: number
    ttfb: number
  }
}

export function CoreWebVitalsOverview({ coreWebVitals }: CoreWebVitalsOverviewProps) {
  const safeCoreWebVitals = coreWebVitals || {
    lcp: 0,
    fid: 0,
    cls: 0,
    fcp: 0,
    ttfb: 0
  }

  const getCoreWebVitalsStatus = (metric: string, value: number) => {
    const thresholds = {
      lcp: { good: 2.5, poor: 4.0 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1.8, poor: 3.0 },
      ttfb: { good: 800, poor: 1800 }
    }

    const threshold = thresholds[metric as keyof typeof thresholds]
    if (!threshold) return { status: 'unknown', color: 'text-gray-500' }

    if (value <= threshold.good) {
      return { status: 'good', color: 'text-green-600' }
    } else if (value <= threshold.poor) {
      return { status: 'needs improvement', color: 'text-yellow-600' }
    } else {
      return { status: 'poor', color: 'text-red-600' }
    }
  }

  const getMetricDescription = (metric: string) => {
    const descriptions = {
      lcp: 'Largest Contentful Paint',
      fid: 'First Input Delay',
      cls: 'Cumulative Layout Shift',
      fcp: 'First Contentful Paint',
      ttfb: 'Time to First Byte'
    }
    return descriptions[metric as keyof typeof descriptions] || metric
  }

  const getMetricUnit = (metric: string) => {
    if (metric === 'lcp' || metric === 'fcp' || metric === 'ttfb') return 's'
    if (metric === 'fid') return 'ms'
    return ''
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Core Web Vitals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(safeCoreWebVitals).map(([metric, value]) => {
            const status = getCoreWebVitalsStatus(metric, value)
            return (
              <div key={metric} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    status.status === 'good' ? 'bg-green-500' :
                    status.status === 'needs improvement' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <div className="font-medium uppercase">{metric}</div>
                    <div className="text-sm text-gray-600">
                      {getMetricDescription(metric)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${status.color}`}>
                    {value}{getMetricUnit(metric)}
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {status.status}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
