"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Search, X, MapPin, Home, DollarSign } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { BHKConfiguration } from '@/types/property'
import type { LocationData } from '@/lib/locations-data'
import SearchSuggestions from './SearchSuggestions'
import { autoCorrectQuery, REAL_ESTATE_DICTIONARY } from '@/lib/search/fuzzy-search'

interface SearchResult {
  id: string
  title: string
  type: 'property' | 'location' | 'type'
  subtitle?: string
  price?: number
  location?: string
  fuzzyScore?: number
  matchedFields?: string[]
}

interface EnhancedProperty {
  id: string
  slug: string
  title: string
  description: string
  location: string
  property_nature: string
  video_url?: string
  created_at: string
  updated_at: string
  status: string
  property_collection?: string
  fuzzyScore?: number
  matchedFields?: string[]
  property_configurations?: BHKConfiguration[]
  property_images?: Array<{ id: string; image_url: string }>
  property_locations?: Array<{ id: string; name: string; description: string }>
}

interface SearchInputProps {
  onClose: () => void
  isActive: boolean
}

export default function SearchInput({ onClose, isActive }: SearchInputProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [correctedQuery, setCorrectedQuery] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Focus input when component becomes active
  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isActive])

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory')
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory))
      } catch (error) {
        console.error('Error parsing search history:', error)
      }
    }
  }, [])

  // Save search to history
  const saveToHistory = (searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    const newHistory = [searchQuery, ...searchHistory.filter(item => item !== searchQuery)].slice(0, 10)
    setSearchHistory(newHistory)
    localStorage.setItem('searchHistory', JSON.stringify(newHistory))
  }

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowResults(false)
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Enhanced search with fuzzy matching
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setShowResults(false)
      setShowSuggestions(true)
      return
    }

    setLoading(true)
    setShowSuggestions(true) // Show suggestions while searching

    try {
      // Auto-correct the query
      let corrected = ''
      try {
        corrected = autoCorrectQuery(searchQuery, REAL_ESTATE_DICTIONARY)
      } catch (error) {
        console.warn('Error in auto-correction:', error)
        corrected = searchQuery
      }
      setCorrectedQuery(corrected !== searchQuery ? corrected : '')

      // Fetch properties and locations in parallel
      const [propertiesResponse, locationsResponse] = await Promise.all([
        fetch(`/api/properties/enhanced?search=${encodeURIComponent(searchQuery)}&limit=20`),
        fetch(`/api/locations?search=${encodeURIComponent(searchQuery)}&limit=10`)
      ])

      if (!propertiesResponse.ok || !locationsResponse.ok) {
        throw new Error('Failed to fetch search results')
      }

      const propertiesData = await propertiesResponse.json()
      const locationsData = await locationsResponse.json()

      const searchResults: SearchResult[] = []

      // Add properties (already fuzzy-searched by enhanced API)
      if (propertiesData.properties && Array.isArray(propertiesData.properties)) {
        propertiesData.properties.forEach((property: EnhancedProperty) => {
          try {
            const lowestPrice = property.property_configurations?.reduce((min: number, config: BHKConfiguration) => {
              return config.price && config.price < min ? config.price : min
            }, Infinity)

            searchResults.push({
              id: property.id,
              title: property.title || 'Untitled Property',
              type: 'property',
              subtitle: property.location || 'Location not specified',
              price: lowestPrice !== Infinity ? lowestPrice : undefined,
              location: property.location,
              fuzzyScore: property.fuzzyScore || 1.0,
              matchedFields: property.matchedFields || ['title']
            })
          } catch (error) {
            console.warn('Error processing property:', error)
            // Skip this property and continue
          }
        })
      }

      // Add locations
      locationsData.locations?.forEach((location: LocationData) => {
        try {
          searchResults.push({
            id: location.id,
            title: location.name || 'Unnamed Location',
            type: 'location',
            subtitle: location.description || '',
            location: location.name
          })
        } catch (error) {
          console.warn('Error processing location:', error)
          // Skip this location and continue
        }
      })

      // Add property types
      const propertyTypes = ['Apartment', 'House', 'Villa', 'Penthouse', 'Commercial', 'Land']
      propertyTypes.forEach(type => {
        try {
          if (type.toLowerCase().includes(searchQuery.toLowerCase())) {
            searchResults.push({
              id: `type-${type}`,
              title: `${type} Properties`,
              type: 'type',
              subtitle: `Browse all ${type.toLowerCase()} properties`
            })
          }
        } catch (error) {
          console.warn('Error processing property type:', error)
          // Skip this type and continue
        }
      })

      // Sort results by type priority and fuzzy score
      searchResults.sort((a, b) => {
        const typeOrder = { property: 0, location: 1, type: 2 }
        const typeDiff = typeOrder[a.type] - typeOrder[b.type]
        if (typeDiff !== 0) return typeDiff
        
        // Within same type, sort by fuzzy score
        const scoreA = a.fuzzyScore || 0
        const scoreB = b.fuzzyScore || 0
        return scoreB - scoreA
      })

      setResults(searchResults.slice(0, 10))
      setShowResults(true)
      setShowSuggestions(false) // Hide suggestions when showing results
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
      setShowResults(false)
      setShowSuggestions(true) // Show suggestions on error
    } finally {
      setLoading(false)
    }
  }

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  const handleResultClick = (result: SearchResult) => {
    // Save to search history
    saveToHistory(result.title)
    
    switch (result.type) {
      case 'property':
        router.push(`/properties/${result.id}`)
        break
      case 'location':
        router.push(`/properties?location=${result.id}&locationName=${encodeURIComponent(result.title)}`)
        break
      case 'type':
        router.push(`/properties?type=${result.title}`)
        break
    }
    setShowResults(false)
    setShowSuggestions(false)
    setQuery('')
    onClose()
  }

  const handleSuggestionSelect = (suggestion: string) => {
    setQuery(suggestion)
    saveToHistory(suggestion)
    setShowSuggestions(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div className="relative w-full max-w-xl">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search properties, locations, or types..."
          className="w-full px-4 py-3 pl-12 pr-12 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition text-gray-700 bg-white"
        />
        
        {/* Search Icon */}
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 transition-colors"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* Auto-correction suggestion */}
      {correctedQuery && (
        <div className="absolute top-full left-0 right-0 mt-1 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          Did you mean: <strong>{correctedQuery}</strong>?
        </div>
      )}

      {/* Search Suggestions */}
      <SearchSuggestions
        query={query}
        isVisible={showSuggestions && !showResults}
        onSuggestionSelect={handleSuggestionSelect}
        onClose={() => setShowSuggestions(false)}
      />

      {/* Search Results Dropdown */}
      {showResults && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50"
        >
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  {/* Icon based on type */}
                  <div className="flex-shrink-0">
                    {result.type === 'property' && <Home className="h-4 w-4 text-blue-600" />}
                    {result.type === 'location' && <MapPin className="h-4 w-4 text-green-600" />}
                    {result.type === 'type' && <DollarSign className="h-4 w-4 text-purple-600" />}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{result.title}</div>
                    {result.subtitle && (
                      <div className="text-sm text-gray-500 truncate">{result.subtitle}</div>
                    )}
                    {result.price && result.price > 0 && (
                      <div className="text-sm text-blue-600 font-medium">
                        ₹{Math.round(result.price / 100000)}L
                      </div>
                    )}
                    {result.fuzzyScore && result.fuzzyScore > 0.7 && (
                      <div className="text-xs text-green-600 mt-1">
                        {Math.round(result.fuzzyScore * 100)}% match
                      </div>
                    )}
                    {result.matchedFields && result.matchedFields.length > 0 && (
                      <div className="text-xs text-gray-400 mt-1">
                        Matched: {result.matchedFields.slice(0, 2).join(', ')}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="p-4 text-center text-gray-500">
              No results found for &quot;{query}&quot;
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
} 