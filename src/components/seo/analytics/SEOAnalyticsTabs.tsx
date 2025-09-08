'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OverviewTab } from './tabs/OverviewTab'
import { TrafficTab } from './tabs/TrafficTab'
import { KeywordsTab } from './tabs/KeywordsTab'
import { PerformanceTab } from './tabs/PerformanceTab'
import type { SEOAnalyticsData } from '@/types/seo-analytics'

interface SEOAnalyticsTabsProps {
  data: SEOAnalyticsData
  activeTab: string
  onTabChange: (tab: string) => void
}

export function SEOAnalyticsTabs({ data, activeTab, onTabChange }: SEOAnalyticsTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="traffic">Traffic Sources</TabsTrigger>
        <TabsTrigger value="keywords">Keywords</TabsTrigger>
        <TabsTrigger value="performance">Performance</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <OverviewTab data={data} />
      </TabsContent>

      <TabsContent value="traffic" className="space-y-6">
        <TrafficTab data={data} />
      </TabsContent>

      <TabsContent value="keywords" className="space-y-6">
        <KeywordsTab data={data} />
      </TabsContent>

      <TabsContent value="performance" className="space-y-6">
        <PerformanceTab data={data} />
      </TabsContent>
    </Tabs>
  )
}

