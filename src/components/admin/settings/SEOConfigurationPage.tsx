'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
// import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  Search, 
  Settings, 
  Monitor, 
  FileText, 
  Zap,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  // Eye,
  // Target,
  Globe,
  TestTube
} from 'lucide-react'
import { SEODashboard } from '@/components/seo/SEODashboard'
import { SEOAuditContainer } from '@/components/seo/audit'
// import { SEOAlerts } from '@/components/seo/SEOAlerts'
import { SEOAnalytics } from '@/components/seo/SEOAnalytics'
import { SEOStructuredData } from '@/components/seo/SEOStructuredData'
import { SEOPerformanceRefactored } from '@/components/seo/performance'
import { SEOMonitoringRefactored } from '@/components/seo/monitoring'
import { SEOSettingsContainer } from '@/components/seo/settings'
import { SEOTestingContainer } from '@/components/seo/testing'
import { Settings as SettingsType } from '@/lib/settings'

interface SEOConfigurationPageProps {
  settings: SettingsType
}

export function SEOConfigurationPage({ settings }: SEOConfigurationPageProps) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const searchParams = useSearchParams()

  // Handle URL parameter to switch to specific tab
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['dashboard', 'audit', 'settings', 'testing', 'alerts', 'analytics', 'structured-data', 'performance'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const seoFeatures = [
    {
      id: 'dashboard',
      title: 'SEO Dashboard',
      description: 'Overview of SEO performance and key metrics',
      icon: BarChart3,
      status: 'active',
      color: 'bg-blue-500'
    },
    {
      id: 'audit',
      title: 'SEO Audit',
      description: 'Real-time SEO analysis and recommendations',
      icon: Search,
      status: 'active',
      color: 'bg-green-500'
    },
    {
      id: 'analytics',
      title: 'Analytics & Tracking',
      description: 'GA4, GSC, and performance monitoring',
      icon: TrendingUp,
      status: 'active',
      color: 'bg-purple-500'
    },
    {
      id: 'structured-data',
      title: 'Structured Data',
      description: 'Rich snippets and schema markup',
      icon: FileText,
      status: 'active',
      color: 'bg-orange-500'
    },
    {
      id: 'performance',
      title: 'Performance',
      description: 'Core Web Vitals and optimization',
      icon: Zap,
      status: 'active',
      color: 'bg-yellow-500'
    },
    {
      id: 'monitoring',
      title: 'Monitoring',
      description: 'Real-time SEO monitoring and alerts',
      icon: Monitor,
      status: 'active',
      color: 'bg-red-500'
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200"><AlertTriangle className="w-3 h-3 mr-1" />Warning</Badge>
      case 'error':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Error</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* SEO Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            SEO Features Overview
          </CardTitle>
          <CardDescription>
            All SEO features are integrated and ready to use. Click on any tab below to access specific tools.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {seoFeatures.map((feature) => {
              const IconComponent = feature.icon
              return (
                <div
                  key={feature.id}
                  className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setActiveTab(feature.id)}
                >
                  <div className={`p-2 rounded-lg ${feature.color} text-white`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm truncate">{feature.title}</h3>
                      {getStatusBadge(feature.status)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{feature.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main SEO Tools */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Audit</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <TestTube className="w-4 h-4" />
            <span className="hidden sm:inline">Testing</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="structured-data" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Schema</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Performance</span>
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            <span className="hidden sm:inline">Monitor</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                SEO Dashboard
              </CardTitle>
              <CardDescription>
                Comprehensive overview of your website&apos;s SEO performance and key metrics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SEODashboard />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                SEO Audit
              </CardTitle>
              <CardDescription>
                Real-time SEO analysis, content optimization, and technical recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SEOAuditContainer />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                SEO Settings
              </CardTitle>
              <CardDescription>
                Configure all SEO settings, analytics, and monitoring preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SEOSettingsContainer settings={settings as unknown as Record<string, unknown>} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
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
            <CardContent>
              <SEOTestingContainer />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <SEOAnalytics />
        </TabsContent>

        <TabsContent value="structured-data" className="space-y-4">
          <SEOStructuredData />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <SEOPerformanceRefactored />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <SEOMonitoringRefactored />
        </TabsContent>
      </Tabs>
    </div>
  )
}


