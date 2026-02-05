'use client'

import { useState } from 'react'
import { useAnalytics } from '@/hooks/useAnalytics'

export function SearchTrackingExample() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)
  
  const { trackSearch, trackEvent } = useAnalytics()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    
    try {
      // Track the search query
      trackSearch(searchQuery)
      
      // Track search start event
      trackEvent('search_started', {
        category: 'search',
        label: searchQuery,
      })
      
      // Simulate search delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulate search results
      const mockResults = [
        `Property 1 - ${searchQuery}`,
        `Property 2 - ${searchQuery}`,
        `Property 3 - ${searchQuery}`,
        `Property 4 - ${searchQuery}`,
        `Property 5 - ${searchQuery}`,
      ]
      
      setSearchResults(mockResults)
      
      // Track search completion with results count
      trackSearch(searchQuery, mockResults.length)
      
      // Track search success event
      trackEvent('search_completed', {
        category: 'search',
        label: searchQuery,
        value: mockResults.length,
      })
      
    } catch {
      // Track search error
      trackEvent('search_error', {
        category: 'search',
        label: searchQuery,
        value: 0,
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleResultClick = (result: string) => {
    // Track result click
    trackEvent('search_result_click', {
      category: 'search',
      label: result,
    })
    
    alert(`Clicked on: ${result}`)
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Search Tracking Example</h3>
      <p className="text-sm text-gray-600">
        This search demonstrates search query tracking. Enter a search term to see tracking in action.
      </p>
      
      <form onSubmit={handleSearch} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter search term..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
      
      {searchResults.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Search Results ({searchResults.length})</h4>
          <div className="space-y-1">
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => handleResultClick(result)}
                className="w-full text-left p-2 hover:bg-gray-100 rounded border border-gray-200"
              >
                {result}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <p className="text-xs text-gray-500">
        This search tracks: search queries, result counts, result clicks, and search errors.
        Check your analytics dashboard to see the events.
      </p>
    </div>
  )
}
