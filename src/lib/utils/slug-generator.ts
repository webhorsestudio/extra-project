/**
 * Utility functions for generating SEO-friendly slugs
 */

/**
 * Generate a URL-friendly slug from text
 * @param text - The text to convert to a slug
 * @returns A URL-friendly slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Remove special characters except spaces and hyphens
    .replace(/[^a-z0-9\s-]/g, '')
    // Replace multiple spaces with single hyphen
    .replace(/\s+/g, '-')
    // Replace multiple hyphens with single hyphen
    .replace(/-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Limit length to 100 characters
    .substring(0, 100)
}

/**
 * Generate a property slug from title and location
 * @param title - Property title
 * @param location - Property location
 * @returns A unique property slug
 */
export function generatePropertySlug(title: string, location: string): string {
  const baseSlug = generateSlug(`${title} ${location}`)
  return baseSlug
}

/**
 * Generate a unique slug by appending a counter if needed
 * @param baseSlug - The base slug
 * @param existingSlugs - Array of existing slugs to check against
 * @returns A unique slug
 */
export function ensureUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let finalSlug = baseSlug
  let counter = 0

  while (existingSlugs.includes(finalSlug)) {
    counter++
    finalSlug = `${baseSlug}-${counter}`
  }

  return finalSlug
}

/**
 * Validate if a string is a valid slug
 * @param slug - The slug to validate
 * @returns True if valid, false otherwise
 */
export function isValidSlug(slug: string): boolean {
  // Check if slug matches the pattern: lowercase letters, numbers, and hyphens only
  const slugRegex = /^[a-z0-9-]+$/
  return slugRegex.test(slug) && slug.length > 0 && slug.length <= 100
}

/**
 * Examples of slug generation:
 * 
 * Input: "Luxury 4 BHK Residences at Ekta Lilou Ville, Santacruz West"
 * Output: "luxury-4-bhk-residences-at-ekta-lilou-ville-santacruz-west"
 * 
 * Input: "3BHK Apartment in Bandra West"
 * Output: "3bhk-apartment-in-bandra-west"
 * 
 * Input: "Premium Villa with Sea View - Juhu"
 * Output: "premium-villa-with-sea-view-juhu"
 */
