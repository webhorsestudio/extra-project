'use client'

// import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info,
  // ExternalLink,
  // Download,
  RefreshCw
} from 'lucide-react'
import { PDFReportButton } from './actions/PDFReportButton'

interface SEOAuditResultsDialogProps {
  isOpen: boolean
  onClose: () => void
  auditResult: Record<string, unknown> | null
  onRunNewAudit?: () => void
}

export function SEOAuditResultsDialog({ 
  isOpen, 
  onClose, 
  auditResult,
  onRunNewAudit 
}: SEOAuditResultsDialogProps) {
  if (!auditResult) return null

  // Ensure we have safe defaults for all properties
  const safeAuditResult = {
    score: Number(auditResult.score || 0),
    passedChecks: Number(auditResult.passedChecks || 0),
    failedChecks: Number(auditResult.failedChecks || 0),
    warnings: Number(auditResult.warnings || 0),
    issues: Array.isArray(auditResult.issues) ? auditResult.issues.map(issue => ({
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
    recommendations: Array.isArray(auditResult.recommendations) ? auditResult.recommendations.map(rec => ({
      title: String(rec.title || ''),
      category: String(rec.category || ''),
      description: String(rec.description || ''),
      message: String(rec.message || ''),
      impact: String(rec.impact || ''),
      effort: String(rec.effort || ''),
      ...(typeof rec === 'string' ? { text: rec } : {})
    })) : [],
    technicalDetails: auditResult.technicalDetails || {}
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            SEO Audit Results
          </DialogTitle>
          <DialogDescription>
            Comprehensive analysis of your website&apos;s SEO performance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Overall SEO Score</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-6xl font-bold">
                <span className={getScoreColor(safeAuditResult.score)}>
                  {safeAuditResult.score}
                </span>
                <span className="text-2xl text-gray-500">/100</span>
              </div>
              <div className="text-2xl font-semibold text-gray-700">
                Grade: {getScoreGrade(safeAuditResult.score)}
              </div>
              <Progress value={safeAuditResult.score} className="h-3" />
              <p className="text-sm text-gray-600">
                {getScoreDescription(safeAuditResult.score)}
              </p>
            </CardContent>
          </Card>

          {/* Audit Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {safeAuditResult.passedChecks}
                </div>
                <div className="text-sm text-gray-600">Passed Checks</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {safeAuditResult.failedChecks}
                </div>
                <div className="text-sm text-gray-600">Failed Checks</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {safeAuditResult.warnings}
                </div>
                <div className="text-sm text-gray-600">Warnings</div>
              </CardContent>
            </Card>
          </div>

          {/* Issues */}
          {safeAuditResult.issues && safeAuditResult.issues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Issues Found ({safeAuditResult.issues.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {safeAuditResult.issues.map((issue, index: number) => (
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
          {safeAuditResult.recommendations && safeAuditResult.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Recommendations ({safeAuditResult.recommendations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {safeAuditResult.recommendations.map((rec, index: number) => (
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
          {safeAuditResult.technicalDetails && Object.keys(safeAuditResult.technicalDetails).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Technical Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {Object.entries(safeAuditResult.technicalDetails).map(([key, value]: [string, unknown]) => (
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

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onRunNewAudit && (
            <Button variant="outline" onClick={onRunNewAudit}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Run New Audit
            </Button>
          )}
          <PDFReportButton 
            auditData={safeAuditResult}
            filename="seo-audit-report"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
