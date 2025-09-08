'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { SEODashboardHeader } from './SEODashboardHeader'
import { SEODashboardMetrics } from './SEODashboardMetrics'
import { SEODashboardTabs } from './SEODashboardTabs'
import { generateSEODashboardData } from '@/lib/seo/analytics'

interface SEODashboardContainerProps {
  className?: string
}

interface SEODashboardData {
  overview: {
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
  performance: Record<string, unknown>
  content: Record<string, unknown>
  issues: Array<Record<string, unknown>>
  lastUpdated?: string
  [key: string]: unknown
}

export function SEODashboardContainer({ className = '' }: SEODashboardContainerProps) {
  const [dashboardData, setDashboardData] = useState<SEODashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/seo/dashboard-simple')
        if (response.ok) {
          const result = await response.json()
          setDashboardData(result.data as SEODashboardData)
        } else {
          // Fallback to mock data if API fails
          const data = await generateSEODashboardData()
          setDashboardData({
            ...data,
            lastUpdated: new Date().toISOString()
          })
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setHasError(true)
        // Fallback to mock data
        try {
          const data = await generateSEODashboardData()
          setDashboardData({
            ...data,
            lastUpdated: new Date().toISOString()
          })
        } catch (fallbackError) {
          console.error('Error with fallback data:', fallbackError)
          setHasError(true)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return <SEODashboardLoadingSkeleton className={className} />
  }

  if (hasError) {
    return <SEODashboardError className={className} />
  }

  if (!dashboardData) {
    return <SEODashboardNoData className={className} />
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <SEODashboardHeader />
      <SEODashboardMetrics data={dashboardData} />
      <SEODashboardTabs 
        data={dashboardData} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
    </div>
  )
}

// Loading skeleton component
function SEODashboardLoadingSkeleton({ className }: { className: string }) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-white rounded-lg border p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Error component
function SEODashboardError({ className }: { className: string }) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
      <p className="text-gray-600">There was an error loading the SEO dashboard data. Please try refreshing the page.</p>
    </div>
  )
}

// No data component
function SEODashboardNoData({ className }: { className: string }) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
      <p className="text-gray-600">SEO data will appear here once monitoring is set up.</p>
    </div>
  )
}
