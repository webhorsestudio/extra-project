'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  MousePointer,
  Search,
  ExternalLink,
  BarChart3,
  Target,
  // Zap,
  Globe,
  Smartphone
} from 'lucide-react'
import { SEOAnalyticsData } from '@/types/seo-analytics'

interface SEOAnalyticsProps {
  className?: string
}

export function SEOAnalytics({ className = '' }: SEOAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<SEOAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [period, setPeriod] = useState('30d')

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/seo/analytics?period=${period}`)
        if (response.ok) {
          const result = await response.json()
          setAnalyticsData(result.data as SEOAnalyticsData)
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [period])

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

  if (!analyticsData) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analytics Data</h3>
        <p className="text-gray-600">Analytics data will appear here once tracking is set up.</p>
      </div>
    )
  }

  const overview = analyticsData.overview || {
    totalSessions: 0,
    averageSessionDuration: 0,
    bounceRate: 0,
    conversionRate: 0
  }

  const traffic = analyticsData.traffic || {
    organic: 0,
    direct: 0,
    referral: 0,
    social: 0
  }

  const keywords = analyticsData.keywords || {
    totalKeywords: 0,
    averagePosition: 0,
    rankingChanges: {
      improved: 0,
      declined: 0,
      stable: 0
    },
    topKeywords: []
  }

  const performance = analyticsData.performance || {
    pageSpeed: {
      desktop: 0,
      mobile: 0
    },
    coreWebVitals: {
      lcp: 0,
      fid: 0,
      cls: 0
    },
    mobileUsability: 0
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">SEO Analytics</h2>
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

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {overview.totalSessions.toLocaleString()}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.5%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Session Duration</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(overview.averageSessionDuration)}s
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8.2%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bounce Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(overview.bounceRate)}%
                </p>
              </div>
              <MousePointer className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-red-600">
                <TrendingDown className="h-3 w-3 mr-1" />
                -3.1%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {overview.conversionRate.toFixed(1)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +15.3%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic Sources</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-blue-600" />
                      <span>Organic Search</span>
                    </div>
                    <span className="font-semibold">{traffic.organic}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-green-600" />
                      <span>Direct Traffic</span>
                    </div>
                    <span className="font-semibold">{traffic.direct}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-orange-600" />
                      <span>Referral</span>
                    </div>
                    <span className="font-semibold">{traffic.referral}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-purple-600" />
                      <span>Social</span>
                    </div>
                    <span className="font-semibold">{traffic.social}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Keyword Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Total Keywords</span>
                    <Badge variant="outline">{keywords.totalKeywords}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Average Position</span>
                    <Badge variant="outline">{keywords.averagePosition.toFixed(1)}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Improved Rankings</span>
                    <Badge className="bg-green-100 text-green-800">
                      {keywords.rankingChanges.improved}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Declined Rankings</span>
                    <Badge className="bg-red-100 text-red-800">
                      {keywords.rankingChanges.declined}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(traffic).map(([source, count]) => (
                  <div key={source} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="capitalize">{source}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{count as number}</span>
                      <Progress 
                        value={(count as number) / Math.max(...Object.values(traffic) as number[]) * 100} 
                        className="w-20" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Keywords</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {keywords.topKeywords.slice(0, 10).map((keyword, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{keyword.keyword}</p>
                      <p className="text-sm text-gray-600">Search Volume: {keyword.searchVolume}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">Position {keyword.position}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Page Speed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Desktop</span>
                    <Badge variant="outline">{performance.pageSpeed.desktop}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Mobile</span>
                    <Badge variant="outline">{performance.pageSpeed.mobile}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Core Web Vitals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>LCP</span>
                    <Badge variant="outline">{performance.coreWebVitals.lcp}s</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>FID</span>
                    <Badge variant="outline">{performance.coreWebVitals.fid}ms</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>CLS</span>
                    <Badge variant="outline">{performance.coreWebVitals.cls}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
