/**
 * Schema Types List Component
 * Displays found schema types
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Code, FileText } from 'lucide-react'

interface SchemaTypesListProps {
  foundSchemas: string[]
}

export function SchemaTypesList({ foundSchemas }: SchemaTypesListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Found Schema Types</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {foundSchemas.map((schema, index) => (
            <Badge key={index} variant="outline" className="p-2">
              <Code className="w-3 h-3 mr-1" />
              {schema}
            </Badge>
          ))}
        </div>
        {foundSchemas.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4" />
            <p>No structured data found on this page</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
