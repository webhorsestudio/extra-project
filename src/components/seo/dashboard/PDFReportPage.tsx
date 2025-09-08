'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info,
  // FileText,
  // Download,
  RefreshCw,
  ArrowLeft
} from 'lucide-react'
import { PDFReportButton } from './actions/PDFReportButton'

interface PDFReportPageProps {
  auditData: Record<string, unknown>
  onBack?: () => void
  onRunNewAudit?: () => void
}

export function PDFReportPage({ 
  auditData, 
  onBack,
  onRunNewAudit 
}: PDFReportPageProps) {
  const [, ] = useState(false)

  if (!auditData) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Audit Data</h3>
        <p className="text-gray-600">No audit data available to generate report.</p>
      </div>
    )
  }

  // Ensure we have safe defaults for all properties
  const safeAuditData = {
    score: Number(auditData.score || 0),
    passedChecks: Number(auditData.passedChecks || 0),
    failedChecks: Number(auditData.failedChecks || 0),
    warnings: Number(auditData.warnings || 0),
    issues: Array.isArray(auditData.issues) ? auditData.issues.map(issue => ({
      type: String(issue.type || 'info') as 'error' | 'warning' | 'info',
      category: String(issue.category || ''),
      message: String(issue.message || ''),
      suggestion: String(issue.suggestion || ''),
      priority: String(issue.priority || 'low') as 'high' | 'medium' | 'low',
      title: String(issue.title || ''),
      description: String(issue.description || ''),
      url: String(issue.url || ''),
      recommendation: String(issue.recommendation || ''),
      impact: String(issue.impact || ''),
      effort: String(issue.effort || '')
    })) : [],
    recommendations: Array.isArray(auditData.recommendations) ? auditData.recommendations.map(rec => ({
      title: String(rec.title || ''),
      category: String(rec.category || ''),
      description: String(rec.description || ''),
      message: String(rec.message || ''),
      impact: String(rec.impact || ''),
      effort: String(rec.effort || ''),
      ...(typeof rec === 'string' ? { text: rec } : {})
    })) : [],
    technicalDetails: auditData.technicalDetails || {},
    url: String(auditData.url || ''),
    timestamp: Number(auditData.timestamp || Date.now())
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'A+'
    if (score >= 80) return 'A'
    if (score >= 70) return 'B'
    if (score >= 60) return 'C'
    if (score >= 50) return 'D'
    return 'F'
  }

  const getScoreDescription = (score: number) => {
    if (score >= 90) return 'Excellent SEO performance!'
    if (score >= 80) return 'Good SEO performance with minor improvements needed'
    if (score >= 70) return 'Average SEO performance, several areas need attention'
    if (score >= 60) return 'Below average SEO performance, significant improvements needed'
    if (score >= 50) return 'Poor SEO performance, major improvements required'
    return 'Critical SEO issues, immediate action required'
  }

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getIssueColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'border-red-200 bg-red-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'info':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">SEO Audit Report</h1>
            <p className="text-gray-600 mt-1">Comprehensive analysis of your website&apos;s SEO performance</p>
          </div>
        </div>
        <div className="flex gap-2">
          {onRunNewAudit && (
            <Button variant="outline" onClick={onRunNewAudit}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Run New Audit
            </Button>
          )}
          <PDFReportButton 
            auditData={safeAuditData}
            filename="seo-audit-report"
          />
        </div>
      </div>

      {/* Report Info */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Website URL:</span>
              <p className="text-gray-900">{safeAuditData.url || (typeof window !== 'undefined' ? window.location.origin : 'N/A')}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Report Generated:</span>
              <p className="text-gray-900">{new Date(safeAuditData.timestamp || Date.now()).toLocaleString()}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Report Type:</span>
              <p className="text-gray-900">Comprehensive SEO Audit</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Overall SEO Score</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-6xl font-bold">
            <span className={getScoreColor(safeAuditData.score)}>
              {safeAuditData.score}
            </span>
            <span className="text-2xl text-gray-500">/100</span>
          </div>
          <div className="text-2xl font-semibold text-gray-700">
            Grade: {getScoreGrade(safeAuditData.score)}
          </div>
          <Progress value={safeAuditData.score} className="h-3" />
          <p className="text-sm text-gray-600">
            {getScoreDescription(safeAuditData.score)}
          </p>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {safeAuditData.passedChecks}
            </div>
            <div className="text-sm text-gray-600">Passed Checks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {safeAuditData.failedChecks}
            </div>
            <div className="text-sm text-gray-600">Failed Checks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {safeAuditData.warnings}
            </div>
            <div className="text-sm text-gray-600">Warnings</div>
          </CardContent>
        </Card>
      </div>

      {/* Issues */}
      {safeAuditData.issues && safeAuditData.issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Issues Found ({safeAuditData.issues.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {safeAuditData.issues.map((issue, index: number) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border ${getIssueColor(issue.type)}`}
              >
                <div className="flex items-start gap-3">
                  {getIssueIcon(issue.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">
                        {issue.message || issue.title || issue.description || 'Issue'}
                      </h4>
                      <Badge variant={issue.priority === 'high' ? 'destructive' : 'secondary'}>
                        {issue.priority || 'medium'}
                      </Badge>
                    </div>
                    {issue.url && (
                      <p className="text-sm text-gray-600 mt-1">
                        URL: {issue.url}
                      </p>
                    )}
                    {issue.recommendation && (
                      <p className="text-sm text-gray-700 mt-2">
                        <strong>Recommendation:</strong> {issue.recommendation}
                      </p>
                    )}
                    {issue.impact && (
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Impact:</strong> {issue.impact}
                      </p>
                    )}
                    {issue.effort && (
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Effort:</strong> {issue.effort}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {safeAuditData.recommendations && safeAuditData.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Recommendations ({safeAuditData.recommendations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {safeAuditData.recommendations.map((rec, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    {rec.text ? (
                      <span className="text-sm text-gray-700">{rec.text}</span>
                    ) : (
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">{rec.title || rec.category || 'Recommendation'}</div>
                        <div className="text-sm text-gray-700">{rec.description || rec.message || 'No description available'}</div>
                        {rec.impact && (
                          <div className="text-xs text-gray-500">
                            <strong>Impact:</strong> {rec.impact}
                          </div>
                        )}
                        {rec.effort && (
                          <div className="text-xs text-gray-500">
                            <strong>Effort:</strong> {rec.effort}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Technical Details */}
      {safeAuditData.technicalDetails && Object.keys(safeAuditData.technicalDetails).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Technical Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {Object.entries(safeAuditData.technicalDetails).map(([key, value]: [string, unknown]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-medium text-gray-600">{key}:</span>
                  <span className="text-gray-900">{String(value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
