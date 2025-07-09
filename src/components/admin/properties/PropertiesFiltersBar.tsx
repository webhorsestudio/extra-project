import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Filter, Search, Grid3X3, List, X, DollarSign, CheckCircle, Clock } from 'lucide-react'
import React from 'react'

interface PropertiesFiltersBarProps {
  searchTerm: string
  setSearchTerm: (v: string) => void
  filterType: string
  setFilterType: (v: string) => void
  filterCollection: string
  setFilterCollection: (v: string) => void
  filterStatus: string
  setFilterStatus: (v: string) => void
  filterVerified: string
  setFilterVerified: (v: string) => void
  minPrice: string
  setMinPrice: (v: string) => void
  maxPrice: string
  setMaxPrice: (v: string) => void
  viewMode: 'grid' | 'list'
  setViewMode: (v: 'grid' | 'list') => void
  propertyTypes: string[]
  collections: string[]
  statuses: string[]
  clearFilters: () => void
}

export default function PropertiesFiltersBar({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterCollection,
  setFilterCollection,
  filterStatus,
  setFilterStatus,
  filterVerified,
  setFilterVerified,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  viewMode,
  setViewMode,
  propertyTypes,
  collections,
  statuses,
  clearFilters
}: PropertiesFiltersBarProps) {
  const hasActiveFilters = searchTerm || 
    filterType !== 'all' || 
    filterCollection !== 'all' || 
    filterStatus !== 'all' || 
    filterVerified !== 'all' || 
    minPrice || 
    maxPrice

  const removeFilter = (filterType: string) => {
    switch (filterType) {
      case 'search':
        setSearchTerm('')
        break
      case 'type':
        setFilterType('all')
        break
      case 'collection':
        setFilterCollection('all')
        break
      case 'status':
        setFilterStatus('all')
        break
      case 'verified':
        setFilterVerified('all')
        break
      case 'minPrice':
        setMinPrice('')
        break
      case 'maxPrice':
        setMaxPrice('')
        break
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Basic Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <label htmlFor="search" className="sr-only">Search</label>
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div>
              <label htmlFor="type" className="block text-xs font-medium text-muted-foreground mb-1">Type</label>
              <select
                id="type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">All Types</option>
                {propertyTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="collection" className="block text-xs font-medium text-muted-foreground mb-1">Collection</label>
              <select
                id="collection"
                value={filterCollection}
                onChange={(e) => setFilterCollection(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">All Collections</option>
                {collections.map(collection => (
                  <option key={collection} value={collection}>{collection}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
              <select
                id="status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="verified" className="block text-xs font-medium text-muted-foreground mb-1">Verification</label>
              <select
                id="verified"
                value={filterVerified}
                onChange={(e) => setFilterVerified(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">All Properties</option>
                <option value="verified">Verified Only</option>
                <option value="unverified">Unverified Only</option>
              </select>
            </div>

            <div>
              <label htmlFor="minPrice" className="block text-xs font-medium text-muted-foreground mb-1">Min Price</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="minPrice"
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="maxPrice" className="block text-xs font-medium text-muted-foreground mb-1">Max Price</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="maxPrice"
                  type="number"
                  placeholder="∞"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* View Mode and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              aria-label="Clear filters"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-muted-foreground">Active Filters:</span>
              
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: &quot;{searchTerm}&quot;
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => removeFilter('search')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {filterType !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Type: {filterType}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => removeFilter('type')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {filterCollection !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Collection: {filterCollection}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => removeFilter('collection')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {filterStatus !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status: {filterStatus}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => removeFilter('status')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {filterVerified !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filterVerified === 'verified' ? (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      Verified Only
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3" />
                      Unverified Only
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => removeFilter('verified')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {(minPrice || maxPrice) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Price: {minPrice || '0'} - {maxPrice || '∞'}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => {
                                      removeFilter('minPrice')
                removeFilter('maxPrice')
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 