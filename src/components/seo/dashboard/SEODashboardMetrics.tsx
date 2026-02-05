'use client'

import { FileText, Search, Eye, Link } from 'lucide-react'
import { MetricCard } from './MetricCard'

interface SEODashboardOverview {
  totalPages: number
  indexedPages: number
  organicTraffic: number
  averageRanking: number
  domainAuthority: number
  seoScore?: {
    score: number
    grade: string
    breakdown: Record<string, unknown>
  }
}

interface SEODashboardMetricsProps {
  data: {
    overview: SEODashboardOverview
    [key: string]: unknown
  }
}

export function SEODashboardMetrics({ data }: SEODashboardMetricsProps) {
  // Safely extract and convert overview data to numbers
  const overview = data.overview || {}
  
  // Helper function to safely convert to number
  const toNumber = (value: unknown, fallback = 0): number => {
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
      const parsed = parseFloat(value)
      return isNaN(parsed) ? fallback : parsed
    }
    return fallback
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Pages"
        value={toNumber(overview.totalPages, 0)}
        icon={<FileText className="h-5 w-5" />}
        trend="stable"
      />
      <MetricCard
        title="Indexed Pages"
        value={toNumber(overview.indexedPages, 0)}
        icon={<Search className="h-5 w-5" />}
        trend="up"
      />
      <MetricCard
        title="Organic Traffic"
        value={toNumber(overview.organicTraffic, 0)}
        icon={<Eye className="h-5 w-5" />}
        trend="up"
      />
      <MetricCard
        title="Domain Authority"
        value={toNumber(overview.domainAuthority, 0)}
        icon={<Link className="h-5 w-5" />}
        trend="stable"
      />
    </div>
  )
}
