/**
 * Structured Data Validation Form
 * Input form for URL and schema type selection
 */

// import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search } from 'lucide-react'
// Schema types configuration
const SCHEMA_TYPES = [
  { value: 'Organization', label: 'Organization', description: 'Business or organization information' },
  { value: 'Article', label: 'Article', description: 'News article or blog post' },
  { value: 'Product', label: 'Product', description: 'Product or service information' },
  { value: 'LocalBusiness', label: 'Local Business', description: 'Local business information' },
  { value: 'WebSite', label: 'Website', description: 'Website information' },
  { value: 'BreadcrumbList', label: 'Breadcrumb List', description: 'Navigation breadcrumbs' },
  { value: 'FAQ', label: 'FAQ', description: 'Frequently asked questions' },
  { value: 'Review', label: 'Review', description: 'Product or service review' },
  { value: 'Event', label: 'Event', description: 'Event information' },
  { value: 'Recipe', label: 'Recipe', description: 'Recipe information' }
]

interface StructuredDataFormProps {
  url: string
  setUrl: (url: string) => void
  schemaType: string
  setSchemaType: (type: string) => void
  onValidate: () => void
  loading: boolean
}

export function StructuredDataForm({
  url,
  setUrl,
  schemaType,
  setSchemaType,
  onValidate,
  loading
}: StructuredDataFormProps) {
  const schemaTypes = SCHEMA_TYPES

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="url">URL to Validate</Label>
        <Input
          id="url"
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="schema-type">Schema Type</Label>
        <select
          id="schema-type"
          className="w-full p-2 border border-gray-300 rounded-md"
          value={schemaType}
          onChange={(e) => setSchemaType(e.target.value)}
        >
          <option value="all">All Schema Types</option>
          {schemaTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
      <Button onClick={onValidate} disabled={loading || !url}>
        <Search className="h-4 w-4 mr-2" />
        {loading ? 'Validating...' : 'Validate Structured Data'}
      </Button>
    </div>
  )
}
