/**
 * Structured Data Parser
 * Handles parsing of JSON-LD, Microdata, and RDFa from HTML
 */

import { ParsedStructuredData } from './types'

/**
 * Parse structured data from HTML content
 */
export function parseStructuredData(html: string): ParsedStructuredData[] {
  const structuredData: ParsedStructuredData[] = []

  // Parse JSON-LD
  const jsonLdData = parseJsonLd(html)
  structuredData.push(...jsonLdData)

  // Parse Microdata
  const microdata = parseMicrodata(html)
  structuredData.push(...microdata)

  // Parse RDFa
  const rdfa = parseRdfa(html)
  structuredData.push(...rdfa)

  return structuredData
}

/**
 * Parse JSON-LD structured data
 */
function parseJsonLd(html: string): ParsedStructuredData[] {
  const structuredData: ParsedStructuredData[] = []
  const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis
  let match

  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1])
      const schemaType = Array.isArray(data) ? data[0]?.['@type'] : data['@type']

      if (schemaType) {
        structuredData.push({
          type: schemaType,
          data: data,
          format: 'json-ld',
          valid: true,
          errors: []
        })
      }
    } catch {
      structuredData.push({
        type: 'unknown',
        data: match[1],
        format: 'json-ld',
        valid: false,
        errors: ['Invalid JSON-LD syntax']
      })
    }
  }

  return structuredData
}

/**
 * Parse Microdata structured data
 */
function parseMicrodata(html: string): ParsedStructuredData[] {
  const structuredData: ParsedStructuredData[] = []
  const microdataRegex = /itemscope[^>]*itemtype=["']([^"']+)["'][^>]*>/gi
  let match

  while ((match = microdataRegex.exec(html)) !== null) {
    const schemaType = match[1]
      .replace('http://schema.org/', '')
      .replace('https://schema.org/', '')

    structuredData.push({
      type: schemaType,
      data: null, // Would need more complex parsing for microdata
      format: 'microdata',
      valid: true,
      errors: []
    })
  }

  return structuredData
}

/**
 * Parse RDFa structured data
 */
function parseRdfa(html: string): ParsedStructuredData[] {
  const structuredData: ParsedStructuredData[] = []
  const rdfaRegex = /typeof=["']([^"']+)["'][^>]*>/gi
  let match

  while ((match = rdfaRegex.exec(html)) !== null) {
    const schemaType = match[1]
      .replace('http://schema.org/', '')
      .replace('https://schema.org/', '')

    structuredData.push({
      type: schemaType,
      data: null, // Would need more complex parsing for RDFa
      format: 'rdfa',
      valid: true,
      errors: []
    })
  }

  return structuredData
}

/**
 * Extract schema types from parsed data
 */
export function extractSchemaTypes(structuredData: ParsedStructuredData[]): string[] {
  const types = new Set<string>()
  
  structuredData.forEach(item => {
    if (item.type && item.type !== 'unknown') {
      types.add(item.type)
    }
  })

  return Array.from(types)
}

/**
 * Count structured data by format
 */
export function countByFormat(structuredData: ParsedStructuredData[]): {
  jsonLd: number
  microdata: number
  rdfa: number
  total: number
} {
  const counts = {
    jsonLd: 0,
    microdata: 0,
    rdfa: 0,
    total: structuredData.length
  }

  structuredData.forEach(item => {
    switch (item.format) {
      case 'json-ld':
        counts.jsonLd++
        break
      case 'microdata':
        counts.microdata++
        break
      case 'rdfa':
        counts.rdfa++
        break
    }
  })

  return counts
}
