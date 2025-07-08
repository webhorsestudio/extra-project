'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import NeighborhoodSearchModal from './NeighborhoodSearchModal'
import ConfigurationSearchModal from './ConfigurationSearchModal'
import BudgetSearchModal from './BudgetSearchModal'
import SearchInput from './SearchInput'
import FilterButtons from './FilterButtons'
import { ConfigurationData } from '@/lib/configuration-data-client'
import { BudgetData } from '@/lib/budget-data'
import { Location } from '@/hooks/useLocations'

type ActiveModal = 'none' | 'neighborhood' | 'configuration' | 'budget'

export interface SearchFilters {
  location?: { id: string; name: string }
  configuration?: { type: string; bhk?: string }
  budget?: { min?: number; max?: number }
}

interface SearchBarProps {
  locations?: Location[]
  locationsLoading?: boolean
  locationsError?: string | null
  configurationData?: ConfigurationData
  budgetData?: BudgetData
}

interface SearchState {
  activeModal: ActiveModal
  filters: SearchFilters
  isSearchMode: boolean
  isNavigating: boolean
}

export default function SearchBar({ 
  locations = [], 
  locationsLoading = false, 
  locationsError = null,
  configurationData,
  budgetData
}: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Initialize state from URL params
  const getInitialFilters = useCallback((): SearchFilters => {
    const filters: SearchFilters = {}
    
    const locationId = searchParams.get('location')
    const locationName = searchParams.get('locationName')
    const type = searchParams.get('type')
    const bhk = searchParams.get('bhk')
    const minPrice = searchParams.get('min_price')
    const maxPrice = searchParams.get('max_price')
    
    if (locationId && locationName) {
      filters.location = { 
        id: locationId, 
        name: decodeURIComponent(locationName) 
      }
    }
    
    if (type || bhk) {
      filters.configuration = {
        type: type || '',
        bhk: bhk || undefined
      }
    }
    
    if (minPrice || maxPrice) {
      filters.budget = {
        min: minPrice ? Number(minPrice) : undefined,
        max: maxPrice ? Number(maxPrice) : undefined
      }
    }
    
    return filters
  }, [searchParams])

  const [searchState, setSearchState] = useState<SearchState>({
    activeModal: 'none',
    filters: getInitialFilters(),
    isSearchMode: false,
    isNavigating: false
  })

  // Update filters when URL changes
  useEffect(() => {
    const newFilters = getInitialFilters()
    setSearchState(prev => ({ ...prev, filters: newFilters }))
  }, [getInitialFilters])

  // Input validation
  const validateFilters = useCallback((filters: SearchFilters): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    if (filters.budget) {
      if (filters.budget.min && filters.budget.max && filters.budget.min > filters.budget.max) {
        errors.push('Minimum price cannot be greater than maximum price')
      }
      if (filters.budget.min && filters.budget.min < 0) {
        errors.push('Minimum price cannot be negative')
      }
      if (filters.budget.max && filters.budget.max < 0) {
        errors.push('Maximum price cannot be negative')
      }
    }
    
    if (filters.configuration?.bhk) {
      const bhkNum = Number(filters.configuration.bhk)
      if (isNaN(bhkNum) || bhkNum < 1 || bhkNum > 10) {
        errors.push('BHK must be between 1 and 10')
      }
    }
    
    return { isValid: errors.length === 0, errors }
  }, [])

  // Navigate with filters
  const navigateWithFilters = useCallback((filters: SearchFilters) => {
    const validation = validateFilters(filters)
    if (!validation.isValid) {
      console.error('Search validation errors:', validation.errors)
      return
    }

    setSearchState(prev => ({ ...prev, isNavigating: true }))
    
    const params = new URLSearchParams()
    
    if (filters.location) {
      params.append('location', filters.location.id)
      params.append('locationName', encodeURIComponent(filters.location.name))
    }
    
    if (filters.configuration) {
      if (filters.configuration.type && filters.configuration.type !== 'Any') {
        params.append('type', filters.configuration.type)
      }
      if (filters.configuration.bhk && filters.configuration.bhk !== 'Any') {
        params.append('bhk', filters.configuration.bhk)
      }
    }
    
    if (filters.budget) {
      if (filters.budget.min) {
        params.append('min_price', filters.budget.min.toString())
      }
      if (filters.budget.max) {
        params.append('max_price', filters.budget.max.toString())
      }
    }

    const queryString = params.toString()
            router.push(`/properties${queryString ? `?${queryString}` : ''}`)
  }, [router, validateFilters])

  const handleModalToggle = useCallback((modal: ActiveModal) => {
    setSearchState(prev => ({
      ...prev,
      activeModal: prev.activeModal === modal ? 'none' : modal
    }))
  }, [])

  const closeModal = useCallback(() => {
    setSearchState(prev => ({ ...prev, activeModal: 'none' }))
  }, [])

  const handleLocationSelect = useCallback((locationId: string, locationName: string) => {
    const newFilters = {
      ...searchState.filters,
      location: { id: locationId, name: locationName }
    }
    
    setSearchState(prev => ({ ...prev, filters: newFilters }))
    closeModal()
    navigateWithFilters(newFilters)
  }, [searchState.filters, closeModal, navigateWithFilters])

  const handleConfigurationSelect = useCallback((config: { type: string; bhk?: string }) => {
    const newFilters = {
      ...searchState.filters,
      configuration: config
    }
    
    setSearchState(prev => ({ ...prev, filters: newFilters }))
    closeModal()
    navigateWithFilters(newFilters)
  }, [searchState.filters, closeModal, navigateWithFilters])

  const handleBudgetSelect = useCallback((budget: { min?: number; max?: number }) => {
    const newFilters = {
      ...searchState.filters,
      budget
    }
    
    setSearchState(prev => ({ ...prev, filters: newFilters }))
    closeModal()
    navigateWithFilters(newFilters)
  }, [searchState.filters, closeModal, navigateWithFilters])

  const clearFilter = useCallback((filterType: keyof SearchFilters) => {
    const newFilters = { ...searchState.filters }
    delete newFilters[filterType]
    
    setSearchState(prev => ({ ...prev, filters: newFilters }))
    navigateWithFilters(newFilters)
  }, [searchState.filters, navigateWithFilters])

  const toggleSearchMode = useCallback(() => {
    setSearchState(prev => ({ ...prev, isSearchMode: !prev.isSearchMode }))
  }, [])

  const closeSearchMode = useCallback(() => {
    setSearchState(prev => ({ ...prev, isSearchMode: false }))
  }, [])

  // Reset navigation state when route changes
  useEffect(() => {
    setSearchState(prev => ({ ...prev, isNavigating: false }))
  }, [searchParams])

  useEffect(() => {
    console.log('SearchBar: locations prop =', locations)
    console.log('SearchBar: locations count =', locations.length)
    console.log('SearchBar: locations data =', locations.map(loc => ({ id: loc.id, name: loc.name, property_count: loc.property_count })))
  }, [locations])

  useEffect(() => {
    console.log('SearchBar: configurationData =', configurationData)
  }, [configurationData])

  useEffect(() => {
    console.log('SearchBar: budgetData =', budgetData)
  }, [budgetData])

  const isModalOpen = searchState.activeModal !== 'none'
  const hasFilters = Object.keys(searchState.filters).length > 0

  return (
    <>
      <div className="hidden md:flex flex-1 justify-center px-6">
        {searchState.isSearchMode ? (
          <SearchInput onClose={closeSearchMode} isActive={searchState.isSearchMode} />
        ) : (
          <div className="flex items-center gap-2 w-full max-w-xl">
            <FilterButtons
              filters={searchState.filters}
              activeModal={searchState.activeModal}
              onModalToggle={handleModalToggle}
              onClearFilter={clearFilter}
            />
            
            {/* Search Button */}
            <Button 
              onClick={toggleSearchMode}
              disabled={searchState.isNavigating}
              className={cn(
                "bg-blue-600 text-white rounded-lg p-2.5 hover:bg-blue-700 transition-colors flex-shrink-0",
                {
                  "bg-blue-500": !hasFilters,
                  "bg-blue-600": hasFilters,
                  "opacity-50 cursor-not-allowed": searchState.isNavigating
                }
              )}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}
      {searchState.activeModal === 'neighborhood' && (
        <NeighborhoodSearchModal 
          onClose={closeModal} 
          onLocationSelect={handleLocationSelect}
          locations={locations}
          loading={locationsLoading}
          error={locationsError}
        />
      )}
      {searchState.activeModal === 'configuration' && (
        <ConfigurationSearchModal 
          onClose={closeModal}
          onConfigurationSelect={handleConfigurationSelect}
          configurationData={configurationData}
        />
      )}
      {searchState.activeModal === 'budget' && (
        <BudgetSearchModal 
          onClose={closeModal}
          onBudgetSelect={handleBudgetSelect}
          budgetData={budgetData}
        />
      )}
    </>
  )
} 