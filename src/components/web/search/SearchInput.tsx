"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Search, X, MapPin, Home, DollarSign } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SearchResult {
  id: string
  title: string
  type: 'property' | 'location' | 'type'
  subtitle?: string
  price?: number
  location?: string
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
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Focus input when component becomes active
  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isActive])

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
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search function
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setShowResults(false)
      return
    }

    console.log('Searching for:', searchQuery)
    setLoading(true)
    try {
      // Search properties and locations in parallel
      const [propertiesRes, locationsRes] = await Promise.all([
        fetch(`/api/properties?search=${encodeURIComponent(searchQuery)}`),
        fetch(`/api/locations?search=${encodeURIComponent(searchQuery)}`)
      ])

      // Check if both requests were successful
      if (!propertiesRes.ok || !locationsRes.ok) {
        console.error('Search API error:', { propertiesStatus: propertiesRes.status, locationsStatus: locationsRes.status })
        throw new Error('Failed to fetch search results')
      }

      const [propertiesData, locationsData] = await Promise.all([
        propertiesRes.json(),
        locationsRes.json()
      ])

      console.log('Search results:', { properties: propertiesData.properties?.length || 0, locations: locationsData.locations?.length || 0 })

      const searchResults: SearchResult[] = []

      // Add property results with improved price calculation
      if (propertiesData.properties && Array.isArray(propertiesData.properties)) {
        propertiesData.properties.forEach((property: any) => {
          // Improved price calculation - only consider valid prices
          let lowestPrice = 0
          if (property.property_configurations && Array.isArray(property.property_configurations)) {
            const validPrices = property.property_configurations
              .map((config: any) => config.price)
              .filter((price: number) => price && price > 0)
            
            if (validPrices.length > 0) {
              lowestPrice = Math.min(...validPrices)
            }
          }

          searchResults.push({
            id: property.id,
            title: property.title,
            type: 'property',
            subtitle: property.location || 'Location not specified',
            price: lowestPrice,
            location: property.location
          })
        })
      }

      // Add location results with improved error handling
      if (locationsData.locations && Array.isArray(locationsData.locations)) {
        locationsData.locations.forEach((location: any) => {
          searchResults.push({
            id: location.id,
            title: location.name,
            type: 'location',
            subtitle: `${location.property_count || 0} properties${location.description ? ` • ${location.description}` : ''}`
          })
        })
      }

      // Add property type suggestions with better matching
      const propertyTypes = ['Apartment', 'House', 'Villa', 'Penthouse', 'Commercial']
      propertyTypes.forEach(type => {
        if (type.toLowerCase().includes(searchQuery.toLowerCase())) {
          searchResults.push({
            id: `type-${type}`,
            title: type,
            type: 'type',
            subtitle: 'Property type'
          })
        }
      })

      // Sort results by relevance (properties first, then locations, then types)
      const sortedResults = searchResults.sort((a, b) => {
        const typeOrder = { property: 0, location: 1, type: 2 }
        return typeOrder[a.type] - typeOrder[b.type]
      })

      console.log('Final search results:', sortedResults.length)
      setResults(sortedResults.slice(0, 10)) // Limit to 10 results
      setShowResults(true)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
      setShowResults(false)
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
    setQuery('')
    onClose()
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
                  </div>
                </button>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="p-4 text-center text-gray-500">
              No results found for "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
} 