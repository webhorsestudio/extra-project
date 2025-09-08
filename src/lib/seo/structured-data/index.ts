/**
 * Structured Data Module
 * Centralized exports for structured data functionality
 */

// Types
export * from './types'

// Constants
export * from './constants'

// Core functionality
export { analyzeStructuredData, testStructuredData, getAvailableSchemaTypes, getSchemaTypeConfig } from './service'
export { parseStructuredData, extractSchemaTypes, countByFormat } from './parser'
export { 
  validateStructuredData, 
  generateValidationRecommendations, 
  calculateStructuredDataScore,
  validateSchemaType 
} from './validator'

// Re-export from main structured-data.ts for backward compatibility
export {
  generatePropertyStructuredData,
  generateOrganizationStructuredData,
  generateArticleStructuredData,
  generateBreadcrumbStructuredData,
  generateFAQStructuredData,
  generateLocalBusinessStructuredData,
  generateWebsiteStructuredData
} from '../structured-data'
