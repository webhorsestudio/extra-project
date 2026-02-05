'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OverviewTab } from './tabs/OverviewTab'
import { PerformanceTab } from './tabs/PerformanceTab'
import { ContentTab } from './tabs/ContentTab'
import { IssuesTab } from './tabs/IssuesTab'

interface SEODashboardTabsProps {
  data: Record<string, unknown>
  activeTab: string
  onTabChange: (tab: string) => void
}

export function SEODashboardTabs({ data, activeTab, onTabChange }: SEODashboardTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="performance">Performance</TabsTrigger>
        <TabsTrigger value="content">Content</TabsTrigger>
        <TabsTrigger value="issues">Issues</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <OverviewTab data={data} />
      </TabsContent>

      <TabsContent value="performance" className="space-y-6">
        <PerformanceTab data={data} />
      </TabsContent>

      <TabsContent value="content" className="space-y-6">
        <ContentTab data={data} />
      </TabsContent>

      <TabsContent value="issues" className="space-y-6">
        <IssuesTab data={data} />
      </TabsContent>
    </Tabs>
  )
}
