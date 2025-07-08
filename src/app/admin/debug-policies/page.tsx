'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PoliciesDebugPage() {
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testAPI = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/admin/policies')
      const data = await response.json()
      
      console.log('Debug: API Response:', data)
      setApiResponse(data)
    } catch (err) {
      console.error('Debug: API Error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Policies API Debug</h1>
        <p className="text-muted-foreground">Test the policies API to see what data is returned</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testAPI} disabled={loading}>
            {loading ? 'Testing...' : 'Test API'}
          </Button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <h3 className="font-medium text-red-800">Error:</h3>
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {apiResponse && (
            <div className="space-y-4">
              <h3 className="font-medium">API Response:</h3>
              <pre className="p-4 bg-gray-50 border rounded-md overflow-auto text-sm">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 