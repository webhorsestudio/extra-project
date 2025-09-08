'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Zap, 
  Smartphone, 
  Monitor, 
  // TrendingUp, 
  // TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
  // Clock,
  Target,
  BarChart3
} from 'lucide-react'

interface PerformanceData {
  current: {
    pageSpeed: {
      desktop: number
      mobile: number
    }
    coreWebVitals: {
      lcp: number
      fid: number
      cls: number
      fcp: number
      ttfb: number
    }
    mobileUsability: number
  }
  averages: {
    pageSpeed: {
      desktop: number
      mobile: number
    }
    coreWebVitals: {
      lcp: number
      fid: number
      cls: number
      fcp: number
      ttfb: number
    }
    mobileUsability: number
  }
  trends: {
    pageSpeed: Array<{
      date: string
      desktop: number
      mobile: number
    }>
    coreWebVitals: Array<{
      date: string
      lcp: number
      fid: number
      cls: number
    }>
    mobileUsability: Array<{
      date: string
      score: number
    }>
  }
  scores: {
    overall: number
    pageSpeed: number
    coreWebVitals: number
    mobileUsability: number
  }
  recommendations: Array<{
    type: 'error' | 'warning' | 'info'
    category: string
    message: string
    suggestion: string
    impact: 'high' | 'medium' | 'low'
  }>
  lastUpdated: string
}

interface SEOPerformanceProps {
  className?: string
}

export function SEOPerformance({ className = '' }: SEOPerformanceProps) {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [period, setPeriod] = useState('30d')

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/seo/performance?period=${period}`)
        if (response.ok) {
          const result = await response.json()
          setPerformanceData(result.data as PerformanceData)
        }
      } catch (error) {
        console.error('Error fetching performance data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPerformance()
  }, [period])

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    if (score >= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
    if (score >= 70) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>
    if (score >= 50) return <Badge className="bg-orange-100 text-orange-800">Needs Improvement</Badge>
    return <Badge className="bg-red-100 text-red-800">Poor</Badge>
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

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!performanceData) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Performance Data</h3>
        <p className="text-gray-600">Performance data will appear here once monitoring is set up.</p>
      </div>
    )
  }

  // Safe property access with fallbacks
  const scores = performanceData.scores || {
    overall: 0,
    pageSpeed: 0,
    coreWebVitals: 0,
    mobileUsability: 0
  }

  const current = performanceData.current || {
    pageSpeed: { desktop: 0, mobile: 0 },
    coreWebVitals: { lcp: 0, fid: 0, cls: 0, fcp: 0, ttfb: 0 },
    mobileUsability: 0
  }

  const recommendations = performanceData.recommendations || []

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance Monitoring</h2>
          <p className="text-gray-600 mt-1">Track and analyze your site&apos;s performance metrics</p>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d'].map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p)}
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      {/* Performance Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(scores.overall)}`}>
                  {scores.overall}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              {getScoreBadge(scores.overall)}
            </div>
            <Progress value={scores.overall} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Page Speed</p>
                <p className={`text-2xl font-bold ${getScoreColor(scores.pageSpeed)}`}>
                  {scores.pageSpeed}
                </p>
              </div>
              <Zap className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="mt-2">
              {getScoreBadge(scores.pageSpeed)}
            </div>
            <Progress value={scores.pageSpeed} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Core Web Vitals</p>
                <p className={`text-2xl font-bold ${getScoreColor(scores.coreWebVitals)}`}>
                  {scores.coreWebVitals}
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              {getScoreBadge(scores.coreWebVitals)}
            </div>
            <Progress value={scores.coreWebVitals} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mobile Usability</p>
                <p className={`text-2xl font-bold ${getScoreColor(scores.mobileUsability)}`}>
                  {scores.mobileUsability}
                </p>
              </div>
              <Smartphone className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2">
              {getScoreBadge(scores.mobileUsability)}
            </div>
            <Progress value={scores.mobileUsability} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Performance */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="core-web-vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Page Speed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-blue-600" />
                      <span>Desktop</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{current.pageSpeed.desktop}</span>
                      <Badge variant="outline">
                        {current.pageSpeed.desktop >= 90 ? 'Good' : 
                         current.pageSpeed.desktop >= 50 ? 'Needs Improvement' : 'Poor'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-green-600" />
                      <span>Mobile</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{current.pageSpeed.mobile}</span>
                      <Badge variant="outline">
                        {current.pageSpeed.mobile >= 90 ? 'Good' : 
                         current.pageSpeed.mobile >= 50 ? 'Needs Improvement' : 'Poor'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mobile Usability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {current.mobileUsability}
                  </div>
                  <div className="text-sm text-gray-600 mb-4">Mobile Usability Score</div>
                  <Progress value={current.mobileUsability} className="mb-4" />
                  <Badge variant="outline">
                    {current.mobileUsability >= 90 ? 'Excellent' : 
                     current.mobileUsability >= 70 ? 'Good' : 
                     current.mobileUsability >= 50 ? 'Needs Improvement' : 'Poor'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="core-web-vitals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Core Web Vitals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(current.coreWebVitals).map(([metric, value]) => {
                  const status = getCoreWebVitalsStatus(metric, value as number)
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
                            {metric === 'lcp' ? 'Largest Contentful Paint' :
                             metric === 'fid' ? 'First Input Delay' :
                             metric === 'cls' ? 'Cumulative Layout Shift' :
                             metric === 'fcp' ? 'First Contentful Paint' :
                             metric === 'ttfb' ? 'Time to First Byte' : metric}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${status.color}`}>
                          {value as number}
                          {metric === 'lcp' || metric === 'fcp' || metric === 'ttfb' ? 's' : 
                           metric === 'fid' ? 'ms' : ''}
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
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          {recommendations.length > 0 ? (
            recommendations.map((rec, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {rec.type === 'error' ? (
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                    ) : rec.type === 'warning' ? (
                      <Info className="w-5 h-5 text-yellow-500 mt-0.5" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{rec.message}</h4>
                        <Badge variant="outline" className="capitalize">
                          {rec.impact}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{rec.suggestion}</p>
                      <div className="mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {rec.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Great Performance!</h3>
                <p className="text-gray-600">No performance recommendations at this time.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
