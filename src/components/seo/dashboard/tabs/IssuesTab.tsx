'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, Info } from 'lucide-react'

interface IssuesTabProps {
  data: {
    issues?: Array<{
      type: 'error' | 'warning' | 'info'
      message: string
      url?: string
      priority: 'high' | 'medium' | 'low'
    }>
    [key: string]: unknown
  }
}

export function IssuesTab({ data }: IssuesTabProps) {
  // Safely extract issues data
  const issues = data.issues || []
  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getIssueBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive' as const
      case 'medium':
        return 'secondary' as const
      default:
        return 'outline' as const
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            SEO Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {issues.length > 0 ? (
              issues.map((issue, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {getIssueIcon(issue.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">
                        {issue.message}
                      </h4>
                      <Badge variant={getIssueBadgeVariant(issue.priority)}>
                        {issue.priority}
                      </Badge>
                    </div>
                    {issue.url && (
                      <p className="text-sm text-gray-600 mt-1">
                        URL: {issue.url}
                      </p>
                    )}
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
