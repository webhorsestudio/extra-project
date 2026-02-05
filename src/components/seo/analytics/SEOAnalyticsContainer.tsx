'use client'

import { useState, useEffect } from 'react'
import { SEOAnalyticsHeader } from './SEOAnalyticsHeader'
import { SEOAnalyticsOverview } from './SEOAnalyticsOverview'
import { SEOAnalyticsTabs } from './SEOAnalyticsTabs'
import type { SEOAnalyticsData } from '@/types/seo-analytics'

interface SEOAnalyticsProps {
  className?: string
}

export function SEOAnalyticsContainer({ className = '' }: SEOAnalyticsProps) {
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
          setAnalyticsData(result.data)
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
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
          <p className="text-gray-500">Analytics data will appear here once available.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <SEOAnalyticsHeader 
        period={period}
        onPeriodChange={setPeriod}
      />
      
      <SEOAnalyticsOverview data={analyticsData} />
      
      <SEOAnalyticsTabs 
        data={analyticsData}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  )
}

