'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Clock, TrendingUp, MapPin, Home, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateSearchSuggestions } from '@/lib/search/fuzzy-search'

interface SearchSuggestion {
  id: string
  text: string
  type: 'recent' | 'popular' | 'trending' | 'location' | 'property_type' | 'amenity'
  icon?: React.ReactNode
  metadata?: {
    count?: number
    location?: string
    price?: string
  }
}

interface FuzzySuggestionResult {
  suggestion: string
  score: number
  type: 'exact' | 'fuzzy' | 'partial'
}

interface SearchSuggestionsProps {
  query: string
  isVisible: boolean
  onSuggestionSelect: (suggestion: string) => void
  onClose: () => void
  className?: string
}

// Mock data - in real implementation, this would come from API
const mockSuggestions: SearchSuggestion[] = [
    // Recent searches
    { id: 'recent-1', text: '2 BHK apartment in Mumbai', type: 'recent', icon: <Clock className="h-4 w-4" /> },
    { id: 'recent-2', text: 'Villa in Bangalore under 1Cr', type: 'recent', icon: <Clock className="h-4 w-4" /> },
    { id: 'recent-3', text: 'Penthouse with swimming pool', type: 'recent', icon: <Clock className="h-4 w-4" /> },
    
    // Popular searches
    { id: 'popular-1', text: '3 BHK apartment', type: 'popular', icon: <TrendingUp className="h-4 w-4" />, metadata: { count: 1250 } },
    { id: 'popular-2', text: 'Ready to move properties', type: 'popular', icon: <TrendingUp className="h-4 w-4" />, metadata: { count: 890 } },
    { id: 'popular-3', text: 'Properties under 50L', type: 'popular', icon: <TrendingUp className="h-4 w-4" />, metadata: { count: 2100 } },
    
    // Trending searches
    { id: 'trending-1', text: 'Smart homes with automation', type: 'trending', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'trending-2', text: 'Eco-friendly apartments', type: 'trending', icon: <TrendingUp className="h-4 w-4" /> },
    
    // Locations
    { id: 'location-1', text: 'Mumbai', type: 'location', icon: <MapPin className="h-4 w-4" />, metadata: { count: 5000 } },
    { id: 'location-2', text: 'Bangalore', type: 'location', icon: <MapPin className="h-4 w-4" />, metadata: { count: 3200 } },
    { id: 'location-3', text: 'Delhi NCR', type: 'location', icon: <MapPin className="h-4 w-4" />, metadata: { count: 2800 } },
    
    // Property types
    { id: 'type-1', text: 'Apartment', type: 'property_type', icon: <Home className="h-4 w-4" />, metadata: { count: 15000 } },
    { id: 'type-2', text: 'Villa', type: 'property_type', icon: <Home className="h-4 w-4" />, metadata: { count: 2500 } },
    { id: 'type-3', text: 'Penthouse', type: 'property_type', icon: <Home className="h-4 w-4" />, metadata: { count: 800 } },
    
    // Amenities
    { id: 'amenity-1', text: 'Swimming pool', type: 'amenity', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'amenity-2', text: 'Gym', type: 'amenity', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'amenity-3', text: 'Parking', type: 'amenity', icon: <DollarSign className="h-4 w-4" /> }
  ]

export default function SearchSuggestions({
  query,
  isVisible,
  onSuggestionSelect,
  onClose,
  className
}: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([])
      return
    }

    setLoading(true)
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Use fuzzy search to find matching suggestions
      let fuzzyResults: FuzzySuggestionResult[] = []
      try {
        fuzzyResults = generateSearchSuggestions(searchQuery, mockSuggestions.map(s => s.text))
      } catch (error) {
        console.warn('Error in fuzzy suggestions:', error)
        // Fallback to simple filtering
        fuzzyResults = mockSuggestions
          .filter(s => s.text.toLowerCase().includes(searchQuery.toLowerCase()))
          .map(s => ({ suggestion: s.text, score: 1.0, type: 'exact' }))
      }
      
      const filteredSuggestions = mockSuggestions.filter(suggestion => 
        fuzzyResults.some(result => result.suggestion === suggestion.text)
      )
      
      // Sort by fuzzy score and limit results
      const sortedSuggestions = filteredSuggestions
        .map(suggestion => {
          const fuzzyResult = fuzzyResults.find(r => r.suggestion === suggestion.text)
          return {
            ...suggestion,
            fuzzyScore: fuzzyResult?.score || 0
          }
        })
        .sort((a, b) => b.fuzzyScore - a.fuzzyScore)
        .slice(0, 8)
      
      setSuggestions(sortedSuggestions)
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (query && isVisible) {
      fetchSuggestions(query)
    } else {
      setSuggestions([])
    }
  }, [query, isVisible, fetchSuggestions])

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onSuggestionSelect(suggestion.text)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isVisible || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        onClose()
        break
    }
  }

  const getSuggestionTypeColor = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'recent':
        return 'text-gray-500'
      case 'popular':
        return 'text-blue-600'
      case 'trending':
        return 'text-green-600'
      case 'location':
        return 'text-purple-600'
      case 'property_type':
        return 'text-orange-600'
      case 'amenity':
        return 'text-pink-600'
      default:
        return 'text-gray-500'
    }
  }

  const getSuggestionTypeLabel = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'recent':
        return 'Recent'
      case 'popular':
        return 'Popular'
      case 'trending':
        return 'Trending'
      case 'location':
        return 'Location'
      case 'property_type':
        return 'Property Type'
      case 'amenity':
        return 'Amenity'
      default:
        return ''
    }
  }

  if (!isVisible) return null

  return (
    <div
      ref={suggestionsRef}
      className={cn(
        "absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50",
        className
      )}
      onKeyDown={handleKeyDown}
    >
      {loading ? (
        <div className="p-4 text-center text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
          Finding suggestions...
        </div>
      ) : suggestions.length > 0 ? (
        <div className="py-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className={cn(
                "w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3",
                selectedIndex === index && "bg-blue-50"
              )}
            >
              {/* Icon */}
              <div className="flex-shrink-0">
                {suggestion.icon || <Search className="h-4 w-4 text-gray-400" />}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 truncate">
                    {suggestion.text}
                  </span>
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full bg-gray-100",
                    getSuggestionTypeColor(suggestion.type)
                  )}>
                    {getSuggestionTypeLabel(suggestion.type)}
                  </span>
                </div>
                
                {suggestion.metadata?.count && (
                  <div className="text-sm text-gray-500 mt-1">
                    {suggestion.metadata.count.toLocaleString()} properties
                  </div>
                )}
                
                {suggestion.metadata?.location && (
                  <div className="text-sm text-gray-500 mt-1">
                    {suggestion.metadata.location}
                  </div>
                )}
                
                {suggestion.metadata?.price && (
                  <div className="text-sm text-blue-600 font-medium mt-1">
                    {suggestion.metadata.price}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      ) : query.trim() ? (
        <div className="p-4 text-center text-gray-500">
          <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p>No suggestions found for &quot;{query}&quot;</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500">
          <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p>Start typing to see suggestions</p>
        </div>
      )}
      
      {/* Footer with tips */}
      {suggestions.length > 0 && (
        <div className="border-t border-gray-100 px-4 py-2 bg-gray-50 rounded-b-xl">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Use ↑↓ to navigate, Enter to select</span>
            <span>Press Esc to close</span>
          </div>
        </div>
      )}
    </div>
  )
}
