/**
 * Fuzzy Search Algorithm with Typo Tolerance
 * Implements Levenshtein distance and fuzzy matching for better search results
 */

export interface FuzzySearchResult {
  item: string;
  score: number;
  matches: number[];
  originalText: string;
}

export interface PropertySearchItem {
  id: string;
  slug?: string;
  title?: string;
  description?: string;
  location?: string;
  property_nature?: string;
  property_type?: string;
  video_url?: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
  property_collection?: string;
}

export interface FuzzyPropertyResult {
  property: PropertySearchItem;
  score: number;
  matchedFields: string[];
}

export interface FuzzySearchOptions {
  threshold?: number; // Minimum score to include (0-1)
  maxResults?: number;
  caseSensitive?: boolean;
  includeScore?: boolean;
  includeMatches?: boolean;
}

/**
 * Calculate Levenshtein distance between two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
  
  // Initialize first row and column
  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
  
  // Fill the matrix
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[b.length][a.length];
}

/**
 * Calculate fuzzy match score between query and text
 */
export function calculateFuzzyScore(query: string, text: string): number {
  // Handle null/undefined inputs gracefully
  if (!query || !text) return 0;
  
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  // Exact match gets highest score
  if (queryLower === textLower) return 1.0;
  
  // Substring match gets high score
  if (textLower.includes(queryLower)) {
    return 0.9 - (textLower.indexOf(queryLower) / textLower.length) * 0.1;
  }
  
  // Word boundary match
  const words = textLower.split(/\s+/);
  const queryWords = queryLower.split(/\s+/);
  
  let wordMatches = 0;
  queryWords.forEach(queryWord => {
    if (words.some(word => word.includes(queryWord))) {
      wordMatches++;
    }
  });
  
  if (wordMatches > 0) {
    return 0.7 + (wordMatches / queryWords.length) * 0.2;
  }
  
  // Fuzzy match using Levenshtein distance
  const distance = levenshteinDistance(queryLower, textLower);
  const maxLength = Math.max(queryLower.length, textLower.length);
  const fuzzyScore = 1 - (distance / maxLength);
  
  // Only return fuzzy score if it's above threshold
  return fuzzyScore > 0.6 ? fuzzyScore : 0;
}

/**
 * Find fuzzy matches in a list of items
 */
export function fuzzySearch<T>(
  query: string,
  items: T[],
  getText: (item: T) => string,
  options: FuzzySearchOptions = {}
): FuzzySearchResult[] {
  const {
    threshold = 0.6,
    maxResults = 10,
    caseSensitive = false,
    includeMatches = true
  } = options;
  
  if (!query || !items || items.length === 0) return [];
  
  const results: FuzzySearchResult[] = [];
  
  items.forEach(item => {
    if (!item) return; // Skip null/undefined items
    
    try {
      const text = getText(item);
      if (typeof text !== 'string' || !text.trim()) return; // Skip if text is not a valid string
      
      const searchText = caseSensitive ? text : text.toLowerCase();
      const searchQuery = caseSensitive ? query : query.toLowerCase();
      
      const score = calculateFuzzyScore(searchQuery, searchText);
      
      if (score >= threshold) {
        const result: FuzzySearchResult = {
          item: text,
          score,
          matches: [],
          originalText: text
        };
        
        if (includeMatches) {
          result.matches = findMatchPositions(searchQuery, searchText);
        }
        
        results.push(result);
      }
    } catch (error) {
      console.warn('Error processing item in fuzzy search:', error);
      // Continue with other items
    }
  });
  
  // Sort by score (highest first) and limit results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}

/**
 * Find positions where query matches in text
 */
function findMatchPositions(query: string, text: string): number[] {
  const positions: number[] = [];
  
  // Handle empty inputs
  if (!query || !text) return positions;
  
  try {
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    
    let index = 0;
    while ((index = textLower.indexOf(queryLower, index)) !== -1) {
      for (let i = 0; i < queryLower.length; i++) {
        positions.push(index + i);
      }
      index += queryLower.length;
    }
  } catch (error) {
    console.warn('Error finding match positions:', error);
  }
  
  return positions;
}

/**
 * Enhanced fuzzy search for property data
 */
export function fuzzySearchProperties(
  query: string,
  properties: PropertySearchItem[],
  options: FuzzySearchOptions = {}
): FuzzyPropertyResult[] {
  const results: FuzzyPropertyResult[] = [];
  
  // Handle empty query or properties
  if (!query || !properties || properties.length === 0) {
    return results;
  }
  
  properties.forEach(property => {
    // Skip if property doesn't have required fields
    if (!property || !property.id) return;
    
    const fields = [
      { text: property.title || '', weight: 1.0, name: 'title' },
      { text: property.description || '', weight: 0.8, name: 'description' },
      { text: property.location || '', weight: 0.9, name: 'location' },
      { text: property.property_type || '', weight: 0.7, name: 'property_type' }
    ].filter(field => field.text.trim() !== ''); // Only include non-empty fields
    
    let maxScore = 0;
    const matchedFields: string[] = [];
    
    fields.forEach(field => {
      try {
        const score = calculateFuzzyScore(query, field.text) * field.weight;
        if (score > maxScore) {
          maxScore = score;
        }
        if (score > 0.6) {
          matchedFields.push(field.name);
        }
      } catch (error) {
        console.warn(`Error calculating fuzzy score for field ${field.name}:`, error);
        // Continue with other fields
      }
    });
    
    if (maxScore >= (options.threshold || 0.6)) {
      results.push({
        property,
        score: maxScore,
        matchedFields
      });
    }
  });
  
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, options.maxResults || 10);
}

/**
 * Search suggestions with fuzzy matching
 */
export function generateSearchSuggestions(
  query: string,
  suggestions: string[],
  options: FuzzySearchOptions = {}
): Array<{
  suggestion: string;
  score: number;
  type: 'exact' | 'fuzzy' | 'partial';
}> {
  const results: Array<{
    suggestion: string;
    score: number;
    type: 'exact' | 'fuzzy' | 'partial';
  }> = [];
  
  // Handle empty inputs
  if (!query || !suggestions || suggestions.length === 0) {
    return results;
  }
  
  suggestions.forEach(suggestion => {
    // Skip if suggestion is not a string
    if (typeof suggestion !== 'string' || !suggestion.trim()) return;
    
    try {
      const score = calculateFuzzyScore(query, suggestion);
      
      if (score >= (options.threshold || 0.6)) {
        let type: 'exact' | 'fuzzy' | 'partial';
        
        if (score === 1.0) {
          type = 'exact';
        } else if (suggestion.toLowerCase().includes(query.toLowerCase())) {
          type = 'partial';
        } else {
          type = 'fuzzy';
        }
        
        results.push({
          suggestion,
          score,
          type
        });
      }
    } catch (error) {
      console.warn(`Error processing suggestion "${suggestion}":`, error);
      // Continue with other suggestions
    }
  });
  
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, options.maxResults || 5);
}

/**
 * Auto-correct common typos in search queries
 */
export function autoCorrectQuery(query: string, dictionary: string[]): string {
  // Handle empty inputs
  if (!query || !dictionary || dictionary.length === 0) {
    return query || '';
  }
  
  const words = query.split(' ');
  const correctedWords = words.map(word => {
    if (!word || word.length < 3) return word; // Don't correct short words
    
    // Find closest match in dictionary
    let bestMatch = word;
    let bestScore = 0;
    
    dictionary.forEach(dictWord => {
      if (typeof dictWord !== 'string' || !dictWord.trim()) return;
      
      try {
        const score = calculateFuzzyScore(word, dictWord);
        if (score > bestScore && score > 0.8) {
          bestScore = score;
          bestMatch = dictWord;
        }
      } catch (error) {
        console.warn(`Error comparing "${word}" with "${dictWord}":`, error);
        // Continue with other dictionary words
      }
    });
    
    return bestMatch;
  });
  
  return correctedWords.join(' ');
}

/**
 * Common real estate terms for auto-correction
 */
export const REAL_ESTATE_DICTIONARY = [
  'apartment', 'house', 'villa', 'penthouse', 'commercial', 'residential',
  'bedroom', 'bathroom', 'kitchen', 'balcony', 'parking', 'garden',
  'mumbai', 'delhi', 'bangalore', 'pune', 'hyderabad', 'chennai',
  'bhk', 'sqft', 'square feet', 'carpet area', 'built up area',
  'ready to move', 'under construction', 'newly launched', 'resale'
];
