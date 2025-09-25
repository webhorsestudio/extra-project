import { FieldErrors } from 'react-hook-form'

export interface FieldError {
  field: string
  message: string
  tab: string
  tabIcon: string
}

// Map form fields to their corresponding tabs
const fieldToTabMap: Record<string, { tab: string; icon: string }> = {
  // Basic Info tab
  title: { tab: 'basic', icon: 'Home' },
  description: { tab: 'basic', icon: 'Home' },
  property_type: { tab: 'basic', icon: 'Home' },
  property_collection: { tab: 'basic', icon: 'Home' },
  posted_by: { tab: 'basic', icon: 'Home' },
  developer_id: { tab: 'basic', icon: 'Home' },
  has_rera: { tab: 'basic', icon: 'Home' },
  rera_number: { tab: 'basic', icon: 'Home' },
  
  // Location tab
  location_id: { tab: 'location', icon: 'MapPin' },
  location: { tab: 'location', icon: 'MapPin' },
  latitude: { tab: 'location', icon: 'MapPin' },
  longitude: { tab: 'location', icon: 'MapPin' },
  
  // Images tab
  video_url: { tab: 'images', icon: 'ImageIcon' },
  
  // Pricing & Rooms tab
  bhk_configurations: { tab: 'configurations', icon: 'Settings' },
}

// Map field names to user-friendly display names
const fieldDisplayNames: Record<string, string> = {
  title: 'Property Title',
  description: 'Property Description',
  property_type: 'Property Type',
  property_collection: 'Property Collection',
  location_id: 'Location Selection',
  location: 'Location',
  latitude: 'Latitude',
  longitude: 'Longitude',
  posted_by: 'Property Posted By',
  developer_id: 'Developer',
  has_rera: 'RERA Registration',
  rera_number: 'RERA Number',
  bhk_configurations: 'BHK Configuration',
  video_url: 'Property Video URL',
  amenities: 'Amenities',
  categories: 'Categories',
}

/**
 * Convert form validation errors to tab-organized field errors
 */
export function mapFormErrorsToTabErrors<T extends Record<string, unknown>>(errors: FieldErrors<T>): FieldError[] {
  const fieldErrors: FieldError[] = []

  // Helper function to process nested errors
  const processErrors = (errors: Record<string, unknown>, prefix = '') => {
    Object.entries(errors).forEach(([field, error]) => {
      const fullFieldName = prefix ? `${prefix}.${field}` : field
      
      if (error && typeof error === 'object' && error !== null) {
        if ('message' in error && error.message) {
          // This is a field error
          const tabMapping = fieldToTabMap[fullFieldName]
          if (tabMapping) {
            fieldErrors.push({
              field: fullFieldName,
              message: error.message as string,
              tab: tabMapping.tab,
              tabIcon: tabMapping.icon
            })
          }
        } else {
          // This might be a nested object (like bhk_configurations array)
          processErrors(error as Record<string, unknown>, fullFieldName)
        }
      }
    })
  }

  processErrors(errors)
  return fieldErrors
}

/**
 * Get user-friendly field display name
 */
export function getFieldDisplayName(field: string): string {
  return fieldDisplayNames[field] || field
}

/**
 * Check if form has validation errors
 */
export function hasFormErrors<T extends Record<string, unknown>>(errors: FieldErrors<T>): boolean {
  return Object.keys(errors).length > 0
}

/**
 * Get tab configuration for display
 */
export const tabConfig = {
  basic: {
    name: 'Basic Info',
    icon: 'Home',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Property details, type, collection, and posting information'
  },
  location: {
    name: 'Location',
    icon: 'MapPin',
    color: 'bg-green-50 text-green-700 border-green-200',
    description: 'Property location and coordinates'
  },
  configurations: {
    name: 'Pricing & Rooms',
    icon: 'Settings',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'BHK configurations, pricing, and room details'
  }
} 