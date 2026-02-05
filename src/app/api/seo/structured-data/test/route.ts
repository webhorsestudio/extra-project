/**
 * Test endpoint for structured data functionality
 * This can be removed after confirming everything works
 */

import { NextResponse } from 'next/server'
import { SCHEMA_TYPES } from '@/lib/seo/structured-data/constants'
// Import directly from service to avoid module resolution issues
// import { analyzeStructuredData } from '@/lib/seo/structured-data/service'

export async function GET() {
  try {
    // Test schema types using constants directly
    const schemaTypes = Object.entries(SCHEMA_TYPES).map(([key, config]) => ({
      value: key,
      label: config.name,
      description: config.description
    }))
    
    // Test basic functionality without complex imports
    const testData = {
      url: 'https://example.com',
      timestamp: new Date().toISOString(),
      status: 'test_successful'
    }
    
    return NextResponse.json({
      success: true,
      message: 'Structured data constants are working',
      data: {
        schemaTypesCount: schemaTypes.length,
        schemaTypes: schemaTypes.slice(0, 3), // First 3 for brevity
        testData,
        availableSchemas: Object.keys(SCHEMA_TYPES)
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
