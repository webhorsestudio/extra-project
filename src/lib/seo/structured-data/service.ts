/**
 * Structured Data Service
 * Main service for structured data validation and analysis
 */

import { StructuredDataValidationResult } from './types'
import { SCHEMA_TYPES } from './constants'
import { parseStructuredData, extractSchemaTypes, countByFormat } from './parser'
import { validateStructuredData, generateValidationRecommendations, calculateStructuredDataScore } from './validator'

/**
 * Analyze structured data for a given URL
 */
export async function analyzeStructuredData(url: string): Promise<StructuredDataValidationResult> {
  try {
    // Fetch the page content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEO-Bot/1.0)',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`)
    }

    const html = await response.text()
    
    // Parse structured data from the HTML
    const structuredData = parseStructuredData(html)
    
    // Validate structured data
    const validationResults = validateStructuredData(structuredData)
    
    // Generate recommendations
    const recommendations = generateValidationRecommendations(structuredData, validationResults)
    
    // Calculate score
    const score = calculateStructuredDataScore(structuredData, validationResults)
    
    // Extract schema types
    const foundSchemas = extractSchemaTypes(structuredData)
    
    return {
      url,
      foundSchemas,
      totalSchemas: structuredData.length,
      validationResults,
      recommendations,
      score,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error fetching or parsing structured data:', error)
    return {
      url,
      foundSchemas: [],
      totalSchemas: 0,
      validationResults: [],
      recommendations: [{
        type: 'error',
        message: 'Failed to fetch or parse the page',
        suggestion: 'Check if the URL is accessible and contains valid HTML'
      }],
      score: 0,
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Test structured data for a URL (simplified version)
 */
export async function testStructuredData(url: string): Promise<{
  type: string
  status: 'success' | 'error' | 'warning'
  message: string
  details: string
  url: string
  data: unknown
}> {
  try {
    // Fetch the page content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEO-Test-Bot/1.0)'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()
    
    // Parse structured data
    const structuredData = parseStructuredData(html)
    const counts = countByFormat(structuredData)
    const schemaTypes = extractSchemaTypes(structuredData)

    const hasStructuredData = structuredData.length > 0

    if (hasStructuredData) {
      return {
        type: 'Structured Data',
        status: 'success',
        message: 'Structured data found',
        details: `JSON-LD: ${counts.jsonLd} blocks, Microdata: ${counts.microdata} elements, RDFa: ${counts.rdfa} elements. Schema types: ${schemaTypes.join(', ') || 'Unknown'}`,
        url: `https://validator.schema.org/#url=${encodeURIComponent(url)}`,
        data: {
          jsonLd: counts.jsonLd > 0,
          microdata: counts.microdata > 0,
          rdfa: counts.rdfa > 0,
          jsonLdCount: counts.jsonLd,
          microdataCount: counts.microdata,
          rdfaCount: counts.rdfa,
          schemaTypes: schemaTypes,
          structuredData: structuredData.slice(0, 5) // Limit to first 5 for response size
        }
      }
    } else {
      return {
        type: 'Structured Data',
        status: 'warning',
        message: 'No structured data detected',
        details: 'Consider adding structured data for better SEO. Recommended: JSON-LD for Organization, WebSite, and content-specific schemas',
        url: `https://validator.schema.org/#url=${encodeURIComponent(url)}`,
        data: {
          jsonLd: false,
          microdata: false,
          rdfa: false,
          jsonLdCount: 0,
          microdataCount: 0,
          rdfaCount: 0,
          schemaTypes: [],
          recommendations: [
            'Add JSON-LD structured data for your organization',
            'Include WebSite schema for your homepage',
            'Add Article schema for blog posts',
            'Include Product schema for e-commerce items',
            'Add LocalBusiness schema if applicable'
          ]
        }
      }
    }
  } catch (error) {
    return {
      type: 'Structured Data',
      status: 'error',
      message: 'Structured data test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      url: `https://validator.schema.org/#url=${encodeURIComponent(url)}`,
      data: null
    }
  }
}

/**
 * Get available schema types
 */
export function getAvailableSchemaTypes(): Array<{ value: string; label: string; description: string }> {
  return Object.entries(SCHEMA_TYPES).map(([key, config]) => ({
    value: key,
    label: config.name,
    description: config.description
  }))
}

/**
 * Get schema type configuration
 */
export function getSchemaTypeConfig(schemaType: string) {
  return SCHEMA_TYPES[schemaType] || null
}
