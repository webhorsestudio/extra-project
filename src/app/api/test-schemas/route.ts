/**
 * Independent test for schema types
 * This bypasses the complex module structure
 */

import { NextResponse } from 'next/server'

// Define schema types directly here
const SCHEMA_TYPES = {
  'Organization': {
    name: 'Organization',
    requiredProperties: ['name'],
    description: 'Business or organization information',
    examples: ['Company name', 'Logo', 'Contact information']
  },
  'Article': {
    name: 'Article',
    requiredProperties: ['headline', 'author', 'datePublished'],
    description: 'News article or blog post',
    examples: ['Headline', 'Author', 'Publication date']
  },
  'Product': {
    name: 'Product',
    requiredProperties: ['name', 'description'],
    description: 'Product or service information',
    examples: ['Product name', 'Description', 'Price']
  }
}

export async function GET() {
  try {
    const schemaTypes = Object.entries(SCHEMA_TYPES).map(([key, config]) => ({
      value: key,
      label: config.name,
      description: config.description
    }))
    
    return NextResponse.json({
      success: true,
      message: 'Schema types test successful',
      data: {
        schemaTypesCount: schemaTypes.length,
        schemaTypes,
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
