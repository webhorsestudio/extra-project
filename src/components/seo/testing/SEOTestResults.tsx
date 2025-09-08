'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BarChart3, CheckCircle, AlertTriangle, TestTube, ExternalLink, Copy, Download } from 'lucide-react'
import { toast } from 'sonner'

interface TestResult {
  type: string
  status: 'success' | 'error' | 'warning' | 'pending'
  message: string
  details?: string
  url?: string
  score?: number
  data?: Record<string, unknown>
}

interface SEOTestResultsProps {
  testResults: TestResult[]
  testUrl: string
}

export function SEOTestResults({ testResults, testUrl }: SEOTestResultsProps) {
  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'pending':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      default:
        return <TestTube className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Pass</Badge>
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">Warning</Badge>
      case 'error':
        return <Badge variant="destructive">Fail</Badge>
      case 'pending':
        return <Badge variant="outline">Testing...</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const copyResults = () => {
    const resultsText = testResults.map(result => 
      `${result.type}: ${result.status.toUpperCase()}\n${result.message}\n${result.details || ''}\n`
    ).join('\n')
    
    navigator.clipboard.writeText(resultsText)
    toast.success('Test results copied to clipboard!')
  }

  const downloadResults = () => {
    const resultsText = testResults.map(result => 
      `${result.type}: ${result.status.toUpperCase()}\n${result.message}\n${result.details || ''}\n`
    ).join('\n')
    
    const blob = new Blob([resultsText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `seo-test-results-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Test results downloaded!')
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Test Results
            </CardTitle>
            <CardDescription>
              SEO test results for {testUrl}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={copyResults}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button size="sm" variant="outline" onClick={downloadResults}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {testResults.map((result, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <h3 className="font-medium">{result.type}</h3>
                    <p className="text-sm text-gray-600">{result.message}</p>
                    {result.details && (
                      <p className="text-sm text-gray-500 mt-1">{result.details}</p>
                    )}
                    {result.score && (
                      <p className="text-sm text-blue-600 mt-1">Score: {result.score}/100</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(result.status)}
                  {result.url && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={result.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
