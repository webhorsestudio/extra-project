/**
 * Simple test endpoint for structured data constants
 */

import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test with hardcoded data first
    const testSchemas = [
      { value: 'Organization', label: 'Organization', description: 'Business or organization information' },
      { value: 'Article', label: 'Article', description: 'News article or blog post' },
      { value: 'Product', label: 'Product', description: 'Product or service information' }
    ]
    
    return NextResponse.json({
      success: true,
      message: 'Basic test successful',
      data: {
        schemaTypesCount: testSchemas.length,
        schemaTypes: testSchemas,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
