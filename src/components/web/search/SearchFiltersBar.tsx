import React from 'react'
import FilterChip from './FilterChip'

export interface SearchFilters {
  location?: { id: string; name: string }
  budget?: { min?: number; max?: number }
  configuration?: { type: string; bhk?: string }
}

interface SearchFiltersBarProps {
  filters: SearchFilters
  onRemoveFilter: (filterKey: keyof SearchFilters) => void
  onClearAll?: () => void
}

const formatBudget = (budget: { min?: number; max?: number }) => {
  if (!budget) return ''
  if (budget.min && budget.max) return `₹${budget.min}L - ₹${budget.max}L`
  if (budget.min) return `From ₹${budget.min}L`
  if (budget.max) return `Up to ₹${budget.max}L`
  return ''
}

const formatConfiguration = (config: { type: string; bhk?: string }) => {
  if (!config) return ''
  if (config.type && config.bhk) return `${config.bhk} Beds, ${config.type}`
  if (config.type) return config.type
  if (config.bhk) return `${config.bhk} Beds`
  return ''
}

const SearchFiltersBar: React.FC<SearchFiltersBarProps> = ({ filters, onRemoveFilter, onClearAll }) => {
  const hasFilters = filters.location || filters.budget || filters.configuration

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {filters.location && (
        <FilterChip
          label={filters.location.name}
          onRemove={() => onRemoveFilter('location')}
        />
      )}
      {filters.budget && (
        <FilterChip
          label={formatBudget(filters.budget)}
          onRemove={() => onRemoveFilter('budget')}
        />
      )}
      {filters.configuration && (
        <FilterChip
          label={formatConfiguration(filters.configuration)}
          onRemove={() => onRemoveFilter('configuration')}
        />
      )}
      {hasFilters && onClearAll && (
        <button
          onClick={onClearAll}
          className="ml-2 text-xs text-blue-600 font-semibold hover:underline bg-transparent border-none px-2 py-1 rounded"
        >
          Clear All
        </button>
      )}
    </div>
  )
}

export default SearchFiltersBar 