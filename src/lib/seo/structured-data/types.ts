/**
 * Structured Data Types and Interfaces
 * Centralized type definitions for structured data functionality
 */

export interface StructuredDataValidationResult {
  url: string
  foundSchemas: string[]
  totalSchemas: number
  validationResults: SchemaValidationResult[]
  recommendations: ValidationRecommendation[]
  score: number
  testId?: string
  timestamp: string
}

export interface SchemaValidationResult {
  schema: string
  status: 'valid' | 'invalid' | 'warning'
  issues: string[]
  recommendations: string[]
}

export interface ValidationRecommendation {
  type: 'error' | 'warning' | 'info'
  message: string
  suggestion: string
}

export interface ParsedStructuredData {
  type: string
  data: unknown
  format: 'json-ld' | 'microdata' | 'rdfa'
  valid: boolean
  errors: string[]
}

export interface StructuredDataTestRequest {
  url: string
  schemaType: string
}

export interface StructuredDataTestResponse {
  success: boolean
  data?: StructuredDataValidationResult
  error?: string
}

export interface SchemaTypeConfig {
  name: string
  requiredProperties: string[]
  description: string
  examples: string[]
}

