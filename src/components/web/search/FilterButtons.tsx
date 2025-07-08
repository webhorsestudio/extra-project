"use client"

import React from 'react'
import { MapPin, Home, DollarSign, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { SearchFilters } from './SearchFiltersBar'

type ActiveModal = 'none' | 'neighborhood' | 'configuration' | 'budget'

interface FilterButtonsProps {
  filters: SearchFilters
  activeModal: ActiveModal
  onModalToggle: (modal: ActiveModal) => void
  onClearFilter: (filterType: keyof SearchFilters) => void
}

export default function FilterButtons({ 
  filters, 
  activeModal, 
  onModalToggle, 
  onClearFilter 
}: FilterButtonsProps) {
  return (
    <div className="w-full max-w-xl bg-white rounded-xl shadow-sm border border-gray-200 px-3 py-2 flex items-center relative">
      {/* Neighborhood Button */}
      <Button 
        variant="ghost"
        onClick={() => onModalToggle('neighborhood')}
        className={cn(
          "flex-1 px-4 py-3 font-semibold text-gray-700 rounded-lg text-base transition-all duration-200 flex items-center justify-center gap-2",
          {
            "bg-blue-50 text-blue-700 border border-blue-200": activeModal === 'neighborhood',
            "hover:bg-gray-50": activeModal !== 'neighborhood',
          }
        )}
      >
        <MapPin className="h-4 w-4" />
        {filters.location ? (
          <div className="flex items-center gap-1">
            <span className="truncate">{filters.location.name}</span>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation()
                onClearFilter('location')
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  onClearFilter('location');
                }
              }}
              className="ml-1 hover:bg-blue-200 rounded-full p-0.5 cursor-pointer"
              aria-label="Clear neighborhood filter"
            >
              <X className="h-3 w-3" />
            </span>
          </div>
        ) : (
          'Neighborhood'
        )}
      </Button>

      <div className="w-px h-7 bg-gray-300 mx-2"></div>

      {/* Configuration Button */}
      <Button 
        variant="ghost"
        onClick={() => onModalToggle('configuration')}
        className={cn(
          "flex-1 px-4 py-3 font-semibold text-gray-700 rounded-lg text-base transition-all duration-200 flex items-center justify-center gap-2",
          {
            "bg-blue-50 text-blue-700 border border-blue-200": activeModal === 'configuration',
            "hover:bg-gray-50": activeModal !== 'configuration',
          }
        )}
      >
        <Home className="h-4 w-4" />
        {filters.configuration ? (
          <div className="flex items-center gap-1">
            <span className="truncate">
              {filters.configuration.type}
              {filters.configuration.bhk && ` ${filters.configuration.bhk}`}
            </span>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation()
                onClearFilter('configuration')
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  onClearFilter('configuration');
                }
              }}
              className="ml-1 hover:bg-blue-200 rounded-full p-0.5 cursor-pointer"
              aria-label="Clear configuration filter"
            >
              <X className="h-3 w-3" />
            </span>
          </div>
        ) : (
          'Configuration'
        )}
      </Button>

      <div className="w-px h-7 bg-gray-300 mx-2"></div>

      {/* Budget Button */}
      <Button 
        variant="ghost"
        onClick={() => onModalToggle('budget')}
        className={cn(
          "flex-1 px-4 py-3 font-semibold text-gray-700 rounded-lg text-base transition-all duration-200 flex items-center justify-center gap-2",
          {
            "bg-blue-50 text-blue-700 border border-blue-200": activeModal === 'budget',
            "hover:bg-gray-50": activeModal !== 'budget',
          }
        )}
      >
        <DollarSign className="h-4 w-4" />
        {filters.budget ? (
          <div className="flex items-center gap-1">
            <span className="truncate">
              {filters.budget.min && filters.budget.max 
                ? `${filters.budget.min}L - ${filters.budget.max}L`
                : filters.budget.min 
                ? `From ${filters.budget.min}L`
                : `Up to ${filters.budget.max}L`
              }
            </span>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation()
                onClearFilter('budget')
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  onClearFilter('budget');
                }
              }}
              className="ml-1 hover:bg-blue-200 rounded-full p-0.5 cursor-pointer"
              aria-label="Clear budget filter"
            >
              <X className="h-3 w-3" />
            </span>
          </div>
        ) : (
          'Budget'
        )}
      </Button>
    </div>
  )
} 