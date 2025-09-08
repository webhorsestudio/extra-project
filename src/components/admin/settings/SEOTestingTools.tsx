'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
// import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
// import { Separator } from '@/components/ui/separator'
import { 
  TestTube, 
  ExternalLink, 
  CheckCircle, 
  AlertTriangle,
  Search,
  Globe,
  FileText,
  Zap,
  BarChart3,
  Eye,
  Download,
  Copy,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

interface TestResult {
  type: string
  status: 'success' | 'error' | 'warning' | 'pending'
  message: string
  details?: string
  url?: string
}

export function SEOTestingTools() {
  const [testUrl, setTestUrl] = useState('')
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runSEOTests = async () => {
    if (!testUrl) {
      toast.error('Please enter a URL to test')
      return
    }

    setIsRunning(true)
    setTestResults([])

    const tests = [
      {
        type: 'Rich Results Test',
        endpoint: '/api/seo/test/rich-results'
      },
      {
        type: 'PageSpeed Insights',
        endpoint: '/api/seo/test/pagespeed'
      },
      {
        type: 'Mobile-Friendly Test',
        endpoint: '/api/seo/test/mobile-friendly'
      },
      {
        type: 'Structured Data',
        endpoint: '/api/seo/test/structured-data'
      },
      {
        type: 'Meta Tags',
        endpoint: '/api/seo/test/meta-tags'
      },
      {
        type: 'Core Web Vitals',
        endpoint: '/api/seo/test/web-vitals'
      }
    ]

    for (const test of tests) {
      try {
        const response = await fetch(test.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: testUrl })
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        
        if (data.success && data.result) {
          setTestResults(prev => [...prev, data.result])
        } else {
          throw new Error(data.error || 'Test failed')
        }

        await new Promise(resolve => setTimeout(resolve, 500)) // Small delay between tests
      } catch (error) {
        setTestResults(prev => [...prev, {
          type: test.type,
          status: 'error',
          message: 'Test failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        }])
      }
    }

    setIsRunning(false)
    toast.success('SEO tests completed!')
  }



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
    <div className="space-y-6">
      {/* Test Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            SEO Testing Tools
          </CardTitle>
          <CardDescription>
            Test your website&apos;s SEO performance, structured data, and Core Web Vitals.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testUrl">Website URL</Label>
            <div className="flex gap-2">
              <Input
                id="testUrl"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="https://yourwebsite.com"
                className="flex-1"
              />
              <Button 
                onClick={runSEOTests} 
                disabled={isRunning || !testUrl}
                className="min-w-32"
              >
                {isRunning ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Testing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <TestTube className="w-4 h-4" />
                    Run Tests
                  </div>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
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
      )}

      {/* Quick Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Quick Tests
          </CardTitle>
          <CardDescription>
            Quick access to popular SEO testing tools and validators.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Search className="w-5 h-5 text-blue-500" />
                <h3 className="font-medium">Google Rich Results</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Test structured data and rich snippets</p>
              <Button size="sm" variant="outline" asChild>
                <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Test Now
                </a>
              </Button>
            </div>

            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-5 h-5 text-green-500" />
                <h3 className="font-medium">PageSpeed Insights</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Analyze page performance and Core Web Vitals</p>
              <Button size="sm" variant="outline" asChild>
                <a href="https://pagespeed.web.dev/" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Test Now
                </a>
              </Button>
            </div>

            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Eye className="w-5 h-5 text-purple-500" />
                <h3 className="font-medium">Mobile-Friendly Test</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Check mobile usability and responsiveness</p>
              <Button size="sm" variant="outline" asChild>
                <a href="https://search.google.com/test/mobile-friendly" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Test Now
                </a>
              </Button>
            </div>

            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-orange-500" />
                <h3 className="font-medium">Schema Validator</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Validate structured data markup</p>
              <Button size="sm" variant="outline" asChild>
                <a href="https://validator.schema.org/" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Test Now
                </a>
              </Button>
            </div>

            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Globe className="w-5 h-5 text-red-500" />
                <h3 className="font-medium">SEO Analyzer</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Comprehensive SEO analysis and recommendations</p>
              <Button size="sm" variant="outline" asChild>
                <a href="https://www.seoptimer.com/" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Test Now
                </a>
              </Button>
            </div>

            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                <h3 className="font-medium">GTmetrix</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Detailed performance analysis and optimization</p>
              <Button size="sm" variant="outline" asChild>
                <a href="https://gtmetrix.com/" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Test Now
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
