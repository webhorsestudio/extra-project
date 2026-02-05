'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Search, 
  Eye, 
  Link, 
  Target,
  AlertTriangle,
  CheckCircle,
  Settings
} from 'lucide-react'

interface SimpleSEODashboardProps {
  className?: string
}

interface SimpleSEODashboardData {
  overview: {
    totalPages: number
    indexedPages: number
    organicTraffic: number
    domainAuthority: number
    seoScore?: {
      score: number
      grade: string
    }
  }
  performance: Record<string, unknown>
  content: Record<string, unknown>
  issues: Array<Record<string, unknown>>
  [key: string]: unknown
}

export function SimpleSEODashboard({ className = '' }: SimpleSEODashboardProps) {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<SimpleSEODashboardData | null>(null)

  useEffect(() => {
    // Simulate loading and set mock data
    const timer = setTimeout(() => {
      setDashboardData({
        overview: {
          totalPages: 127,
          indexedPages: 115,
          organicTraffic: 45230,
          domainAuthority: 68,
          seoScore: {
            score: 85,
            grade: 'B'
          }
        },
        performance: {
          pageSpeed: 92,
          mobileUsability: 88,
          coreWebVitals: {
            lcp: 2.1,
            fid: 85,
            cls: 0.05
          }
        },
        content: {
          topPerformingPages: [
            { url: '/', title: 'Home Page', views: 1250, ranking: 1 },
            { url: '/properties', title: 'Properties', views: 890, ranking: 2 },
            { url: '/about', title: 'About Us', views: 650, ranking: 3 },
          ],
          topKeywords: [
            { keyword: 'real estate', position: 5, traffic: 1200 },
            { keyword: 'properties', position: 8, traffic: 980 },
            { keyword: 'homes for sale', position: 12, traffic: 750 },
          ]
        },
        issues: [
          { type: 'warning', message: 'Some images missing alt text', priority: 'medium' },
          { type: 'info', message: 'Consider adding more internal links', priority: 'low' }
        ]
      })
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

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

  if (!dashboardData) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-600">SEO data will appear here once monitoring is set up.</p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SEO Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor your website&apos;s search engine performance</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Pages"
          value={dashboardData.overview.totalPages || 0}
          icon={<FileText className="h-5 w-5" />}
          trend="stable"
        />
        <MetricCard
          title="Indexed Pages"
          value={dashboardData.overview.indexedPages || 0}
          icon={<Search className="h-5 w-5" />}
          trend="up"
        />
        <MetricCard
          title="Organic Traffic"
          value={dashboardData.overview.organicTraffic || 0}
          icon={<Eye className="h-5 w-5" />}
          trend="up"
        />
        <MetricCard
          title="Domain Authority"
          value={dashboardData.overview.domainAuthority || 0}
          icon={<Link className="h-5 w-5" />}
          trend="stable"
        />
      </div>

      {/* SEO Score and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SEO Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              SEO Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {dashboardData.overview.seoScore?.score || 0}
              </div>
              <div className="text-lg font-semibold text-gray-600 mb-2">
                Grade: {dashboardData.overview.seoScore?.grade || 'F'}
              </div>
              <Progress value={dashboardData.overview.seoScore?.score || 0} className="mb-4" />
              <p className="text-sm text-gray-600">
                {getSEOScoreDescription(dashboardData.overview.seoScore?.score || 0)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <p className="text-sm text-gray-600">
              Perform common SEO tasks quickly
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => alert('Navigate to Audit tab')}
            >
              <Search className="h-4 w-4 mr-2" />
              Run SEO Audit
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => alert('Generate report functionality')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => alert('Navigate to Settings tab')}
            >
              <Settings className="h-4 w-4 mr-2" />
              SEO Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            SEO Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.issues?.length > 0 ? (
              (dashboardData.issues as Record<string, unknown>[]).map((issue: Record<string, unknown>, index: number) => (
                <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {issue.type === 'error' ? (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    ) : issue.type === 'warning' ? (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">
                        {String(issue.message || 'Unknown issue')}
                      </h4>
                      <Badge variant={issue.priority === 'high' ? 'destructive' : 'secondary'}>
                        {String(issue.priority || 'unknown')}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Issues Found</h3>
                <p className="text-gray-600">Your website is performing well!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper components
function MetricCard({ title, value, icon }: {
  title: string
  value: number
  icon: React.ReactNode
  trend: 'up' | 'down' | 'stable'
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
          </div>
          <div className="flex items-center space-x-2">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function getSEOScoreDescription(score: number): string {
  if (score >= 90) return 'Excellent SEO performance!'
  if (score >= 80) return 'Good SEO performance with minor improvements needed'
  if (score >= 70) return 'Average SEO performance, several areas need attention'
  if (score >= 60) return 'Below average SEO performance, significant improvements needed'
  if (score >= 50) return 'Poor SEO performance, major improvements required'
  return 'Critical SEO issues, immediate action required'
}
