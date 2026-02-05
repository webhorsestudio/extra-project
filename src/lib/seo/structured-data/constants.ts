/**
 * Structured Data Constants
 * Schema type configurations and constants
 */

import { SchemaTypeConfig } from './types'

export const SCHEMA_TYPES: Record<string, SchemaTypeConfig> = {
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
  },
  'LocalBusiness': {
    name: 'Local Business',
    requiredProperties: ['name', 'address'],
    description: 'Local business information',
    examples: ['Business name', 'Address', 'Phone number']
  },
  'WebSite': {
    name: 'Website',
    requiredProperties: ['name', 'url'],
    description: 'Website information',
    examples: ['Site name', 'URL', 'Search functionality']
  },
  'BreadcrumbList': {
    name: 'Breadcrumb List',
    requiredProperties: ['itemListElement'],
    description: 'Navigation breadcrumbs',
    examples: ['Breadcrumb items', 'Navigation path']
  },
  'FAQ': {
    name: 'FAQ',
    requiredProperties: ['mainEntity'],
    description: 'Frequently asked questions',
    examples: ['Questions', 'Answers']
  },
  'Review': {
    name: 'Review',
    requiredProperties: ['itemReviewed', 'reviewRating', 'author'],
    description: 'Product or service review',
    examples: ['Item reviewed', 'Rating', 'Reviewer']
  },
  'Event': {
    name: 'Event',
    requiredProperties: ['name', 'startDate'],
    description: 'Event information',
    examples: ['Event name', 'Start date', 'Location']
  },
  'Recipe': {
    name: 'Recipe',
    requiredProperties: ['name', 'ingredients', 'instructions'],
    description: 'Recipe information',
    examples: ['Recipe name', 'Ingredients', 'Instructions']
  }
}
