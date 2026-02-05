'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Search } from 'lucide-react'

interface ContentTabProps {
  data: {
    content?: {
      topPerformingPages?: Array<{
        title: string
        url: string
        views: number
        ranking: number
      }>
      topKeywords?: Array<{
        keyword: string
        position: number
        traffic: number
      }>
    }
    [key: string]: unknown
  }
}

export function ContentTab({ data }: ContentTabProps) {
  // Safely extract content data
  const content = data.content || {}
  const topPerformingPages = content.topPerformingPages || []
  const topKeywords = content.topKeywords || []
  return (
    <div className="space-y-6">
      {/* Top Performing Pages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Top Performing Pages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformingPages.length > 0 ? (
              topPerformingPages.map((page, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{page.title}</h4>
                    <p className="text-sm text-gray-600">{page.url}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{page.views.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">views</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No page data available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Keywords */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Top Keywords
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topKeywords.length > 0 ? (
              topKeywords.map((keyword, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{keyword.keyword}</h4>
                    <p className="text-sm text-gray-600">Position: {keyword.position}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{keyword.traffic.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">traffic</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No keyword data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
