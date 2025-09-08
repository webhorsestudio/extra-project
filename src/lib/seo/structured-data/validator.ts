/**
 * Structured Data Validator
 * Validates structured data against schema.org requirements
 */

import { ParsedStructuredData, SchemaValidationResult, ValidationRecommendation } from './types'
import { SCHEMA_TYPES } from './constants'

/**
 * Validate structured data against schema requirements
 */
export function validateStructuredData(
  structuredData: ParsedStructuredData[]
): SchemaValidationResult[] {
  const results: SchemaValidationResult[] = []

  structuredData.forEach(schema => {
    const issues: string[] = []
    const recommendations: string[] = []

    // Basic validation rules
    if (schema.format === 'json-ld' && schema.data) {
      // Check for required properties based on schema type
      const requiredProps = getRequiredProperties(schema.type)
      requiredProps.forEach(prop => {
        if (!hasProperty(schema.data, prop)) {
          issues.push(`Missing required property: ${prop}`)
          recommendations.push(`Add the required property "${prop}" to your ${schema.type} schema`)
        }
      })

      // Check for common issues
      if (schema.type === 'Organization' && !hasProperty(schema.data, 'name')) {
        issues.push('Organization schema missing name property')
        recommendations.push('Add a name property to your Organization schema')
      }

      if (schema.type === 'Article' && !hasProperty(schema.data, 'headline')) {
        issues.push('Article schema missing headline property')
        recommendations.push('Add a headline property to your Article schema')
      }

      if (schema.type === 'Product' && !hasProperty(schema.data, 'name')) {
        issues.push('Product schema missing name property')
        recommendations.push('Add a name property to your Product schema')
      }

      // Validate JSON-LD structure
      const data = schema.data as Record<string, unknown>
      if (!data['@context']) {
        issues.push('Missing @context property')
        recommendations.push('Add @context property to your JSON-LD schema')
      }

      if (!data['@type']) {
        issues.push('Missing @type property')
        recommendations.push('Add @type property to your JSON-LD schema')
      }
    }

    // Determine status
    let status: 'valid' | 'invalid' | 'warning' = 'valid'
    if (issues.some(issue => issue.includes('Missing required'))) {
      status = 'invalid'
    } else if (issues.length > 0) {
      status = 'warning'
    }

    results.push({
      schema: schema.type,
      status,
      issues,
      recommendations
    })
  })

  return results
}

/**
 * Get required properties for a schema type
 */
function getRequiredProperties(schemaType: string): string[] {
  const config = SCHEMA_TYPES[schemaType]
  return config ? config.requiredProperties : []
}

/**
 * Check if data has a specific property
 */
function hasProperty(data: unknown, property: string): boolean {
  if (Array.isArray(data)) {
    return data.some(item => hasProperty(item, property))
  }

  if (typeof data === 'object' && data !== null) {
    const dataObj = data as Record<string, unknown>
    return dataObj.hasOwnProperty(property) && 
           dataObj[property] !== null && 
           dataObj[property] !== '' &&
           dataObj[property] !== undefined
  }

  return false
}

/**
 * Generate validation recommendations
 */
export function generateValidationRecommendations(
  structuredData: ParsedStructuredData[],
  validationResults: SchemaValidationResult[]
): ValidationRecommendation[] {
  const recommendations: ValidationRecommendation[] = []

  // Check for missing common schemas
  const foundTypes = structuredData.map(s => s.type)

  if (!foundTypes.includes('Organization')) {
    recommendations.push({
      type: 'warning',
      message: 'Organization schema not found',
      suggestion: 'Add Organization schema to provide business information to search engines'
    })
  }

  if (!foundTypes.includes('WebSite')) {
    recommendations.push({
      type: 'info',
      message: 'WebSite schema not found',
      suggestion: 'Add WebSite schema to enable site search functionality'
    })
  }

  // Add validation-based recommendations
  validationResults.forEach(result => {
    if (result.status === 'invalid') {
      recommendations.push({
        type: 'error',
        message: `${result.schema} schema has validation errors`,
        suggestion: result.recommendations.join('; ')
      })
    } else if (result.status === 'warning') {
      recommendations.push({
        type: 'warning',
        message: `${result.schema} schema has warnings`,
        suggestion: result.recommendations.join('; ')
      })
    }
  })

  return recommendations
}

/**
 * Calculate structured data score
 */
export function calculateStructuredDataScore(
  structuredData: ParsedStructuredData[],
  validationResults: SchemaValidationResult[]
): number {
  if (structuredData.length === 0) return 0

  let score = 50 // Base score for having structured data

  // Bonus for multiple schema types
  const uniqueTypes = new Set(structuredData.map(s => s.type))
  score += Math.min(uniqueTypes.size * 10, 30)

  // Bonus for valid schemas
  const validSchemas = validationResults.filter(r => r.status === 'valid').length
  const totalSchemas = validationResults.length
  if (totalSchemas > 0) {
    score += (validSchemas / totalSchemas) * 20
  }

  return Math.min(score, 100)
}

/**
 * Validate specific schema type
 */
export function validateSchemaType(
  data: unknown,
  schemaType: string
): { isValid: boolean; issues: string[]; recommendations: string[] } {
  const issues: string[] = []
  const recommendations: string[] = []
  const config = SCHEMA_TYPES[schemaType]

  if (!config) {
    issues.push(`Unknown schema type: ${schemaType}`)
    return { isValid: false, issues, recommendations }
  }

  // Check required properties
  config.requiredProperties.forEach(prop => {
    if (!hasProperty(data, prop)) {
      issues.push(`Missing required property: ${prop}`)
      recommendations.push(`Add the required property "${prop}" to your ${schemaType} schema`)
    }
  })

  return {
    isValid: issues.length === 0,
    issues,
    recommendations
  }
}
