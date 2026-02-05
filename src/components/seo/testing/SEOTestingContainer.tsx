'use client'

import { useState } from 'react'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { TestTube } from 'lucide-react'
import { SEOTestForm } from './SEOTestForm'
import { SEOTestResults } from './SEOTestResults'
import { SEOQuickTests } from './SEOQuickTests'

interface TestResult {
  type: string
  status: 'success' | 'error' | 'warning' | 'pending'
  message: string
  details?: string
  url?: string
  score?: number
  data?: Record<string, unknown>
}

export function SEOTestingContainer() {
  const [testUrl, setTestUrl] = useState('')
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runSEOTests = async () => {
    if (!testUrl) {
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
  }

  return (
    <div className="space-y-6">
      {/* Test Input Form */}
      <SEOTestForm 
        testUrl={testUrl}
        setTestUrl={setTestUrl}
        onRunTests={runSEOTests}
        isRunning={isRunning}
      />

      {/* Test Results */}
      {testResults.length > 0 && (
        <SEOTestResults 
          testResults={testResults}
          testUrl={testUrl}
        />
      )}

      {/* Quick Tests */}
      <SEOQuickTests />
    </div>
  )
}
