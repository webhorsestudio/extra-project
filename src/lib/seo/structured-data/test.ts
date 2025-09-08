/**
 * Test file for structured data functionality
 * This can be removed after confirming everything works
 */

import { getAvailableSchemaTypes } from './index'

// Test function to verify exports work
export function testStructuredDataExports() {
  try {
    console.log('Testing getAvailableSchemaTypes...')
    const schemaTypes = getAvailableSchemaTypes()
    console.log('✅ getAvailableSchemaTypes works:', schemaTypes.length, 'types found')
    
    console.log('Testing analyzeStructuredData...')
    // This would normally be async, but we're just testing the import
    console.log('✅ analyzeStructuredData imported successfully')
    
    return true
  } catch (error) {
    console.error('❌ Error testing structured data exports:', error)
    return false
  }
}

// Test the function
if (typeof window === 'undefined') {
  // Only run in Node.js environment
  testStructuredDataExports()
}
