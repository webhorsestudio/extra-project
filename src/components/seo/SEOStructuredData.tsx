'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { StructuredDataValidationResult } from '@/lib/seo/structured-data/types'
import { StructuredDataForm } from './structured-data/StructuredDataForm'
import { ValidationSummary } from './structured-data/ValidationSummary'
import { ValidationResults } from './structured-data/ValidationResults'
import { SchemaTypesList } from './structured-data/SchemaTypesList'
import { RecommendationsList } from './structured-data/RecommendationsList'

interface SEOStructuredDataProps {
  className?: string
}

export function SEOStructuredData({ className = '' }: SEOStructuredDataProps) {
  const [url, setUrl] = useState('')
  const [schemaType, setSchemaType] = useState('all')
  const [results, setResults] = useState<StructuredDataValidationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('validation')

  const runValidation = async () => {
    if (!url) {
      toast.error('Please enter a URL to validate')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/seo/structured-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          schemaType,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setResults(result.data)
        toast.success('Structured data validation completed')
      } else {
        throw new Error('Validation failed')
      }
    } catch (error) {
      console.error('Error validating structured data:', error)
      toast.error('Failed to validate structured data')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Structured Data Validation</h2>
          <p className="text-gray-600 mt-1">Validate and analyze structured data on your pages</p>
        </div>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Validate URL</CardTitle>
        </CardHeader>
        <CardContent>
          <StructuredDataForm
            url={url}
            setUrl={setUrl}
            schemaType={schemaType}
            setSchemaType={setSchemaType}
            onValidate={runValidation}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Validation Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <ValidationSummary results={results} />
            </CardContent>
          </Card>

          {/* Detailed Results */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="validation">Validation Results</TabsTrigger>
              <TabsTrigger value="schemas">Found Schemas</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="validation" className="space-y-4">
              <ValidationResults results={results.validationResults} />
            </TabsContent>

            <TabsContent value="schemas" className="space-y-4">
              <SchemaTypesList foundSchemas={results.foundSchemas} />
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <RecommendationsList recommendations={results.recommendations} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
