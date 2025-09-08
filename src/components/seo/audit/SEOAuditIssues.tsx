'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, Info } from 'lucide-react'

interface SEOAuditIssuesProps {
  issues: Array<{
    type: 'error' | 'warning' | 'info'
    category: string
    message: string
    suggestion: string
    priority: 'high' | 'medium' | 'low'
  }>
}

export function SEOAuditIssues({ issues }: SEOAuditIssuesProps) {
  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>
      case 'medium':
        return <Badge variant="default">Medium</Badge>
      default:
        return <Badge variant="secondary">Low</Badge>
    }
  }

  const errorIssues = issues.filter(i => i.type === 'error')
  const warningIssues = issues.filter(i => i.type === 'warning')
  const infoIssues = issues.filter(i => i.type === 'info')

  return (
    <div className="space-y-6">
      {/* Issues Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {errorIssues.length}
            </div>
            <p className="text-sm text-gray-600">Errors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {warningIssues.length}
            </div>
            <p className="text-sm text-gray-600">Warnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {infoIssues.length}
            </div>
            <p className="text-sm text-gray-600">Info</p>
          </CardContent>
        </Card>
      </div>

      {/* Issues List */}
      <Card>
        <CardHeader>
          <CardTitle>Issues Found</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {issues.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Issues Found!</h3>
                <p className="text-gray-600">Your page is well optimized for SEO.</p>
              </div>
            ) : (
              issues.map((issue, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    {getIssueIcon(issue.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{issue.message}</h4>
                      {getPriorityBadge(issue.priority)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{issue.suggestion}</p>
                    <Badge variant="outline" className="text-xs">{issue.category}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
