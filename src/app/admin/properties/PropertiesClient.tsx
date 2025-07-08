'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Eye, Trash2, Plus, Building2, Search, Filter, MoreVertical, Edit } from 'lucide-react'
import Link from 'next/link'
import PropertiesTabs from '@/components/admin/properties/PropertiesTabs'
import PropertyCard from '@/components/admin/properties/PropertyCard'
import PropertiesStats from '@/components/admin/properties/PropertiesStats'
import PropertiesAnalytics from '@/components/admin/properties/PropertiesAnalytics'

interface Property {
  id: string
  title: string
  price: number
  property_type: string
  location: string
  thumbnail_url?: string
  bhk: number
  area: number
  bedrooms: number
  bathrooms: number
  created_at?: string
  status?: string
  rera_number?: string
  view_count?: number
  favorite_count?: number
  review_count?: number
  is_verified?: boolean
  property_collection?: string
}

interface PropertiesClientProps {
  properties: Property[]
}

function PropertiesHeader({ currentView, setCurrentView }: { currentView: 'properties' | 'analytics', setCurrentView: (view: 'properties' | 'analytics') => void }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Properties</h1>
        <p className="text-muted-foreground">
          Manage your property listings and track their performance.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-lg border bg-muted p-1">
          <Button
            variant={currentView === 'properties' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentView('properties')}
            className="text-xs"
          >
            Properties
          </Button>
          <Button
            variant={currentView === 'analytics' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentView('analytics')}
            className="text-xs"
          >
            Analytics
          </Button>
        </div>
        <Link href="/admin/properties/add">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default function PropertiesClient({ properties: initialProperties }: PropertiesClientProps) {
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCollection, setFilterCollection] = useState('all')
  const [filterVerified, setFilterVerified] = useState('all')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedProperties, setSelectedProperties] = useState<string[]>([])
  const [currentView, setCurrentView] = useState<'properties' | 'analytics'>('properties')
  const router = useRouter()

  // Use local state for properties only
  const [properties, setProperties] = useState<Property[]>(initialProperties)

  const [filteredProperties, setFilteredProperties] = useState<Property[]>(properties)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    filterAndSortProperties()
  }, [properties, searchTerm, filterType, filterStatus, filterCollection, filterVerified, minPrice, maxPrice, sortBy, sortOrder])

  const checkAuth = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      router.push('/users/login')
    }
  }

  const filterAndSortProperties = () => {
    let filtered = [...properties]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.property_type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(property => property.property_type === filterType)
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(property => property.status === filterStatus)
    }

    // Collection filter
    if (filterCollection !== 'all') {
      filtered = filtered.filter(property => property.property_collection === filterCollection)
    }

    // Verification filter
    if (filterVerified !== 'all') {
      filtered = filtered.filter(property => {
        if (filterVerified === 'verified') {
          return property.is_verified === true
        } else {
          return property.is_verified !== true
        }
      })
    }

    // Price range filter
    if (minPrice) {
      const min = parseFloat(minPrice)
      if (!isNaN(min)) {
        filtered = filtered.filter(property => property.price >= min)
      }
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice)
      if (!isNaN(max)) {
        filtered = filtered.filter(property => property.price <= max)
      }
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Property]
      let bValue: any = b[sortBy as keyof Property]

      if (sortBy === 'created_at') {
        aValue = new Date(aValue || '').getTime()
        bValue = new Date(bValue || '').getTime()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredProperties(filtered)
  }

  const handleDelete = async (propertyId: string) => {
    try {
      setLoading(true)

      // Delete property images from storage
      const { data: images } = await supabase
        .from('property_images')
        .select('image_url')
        .eq('property_id', propertyId)

      if (images && images.length > 0) {
        const imageUrls = images.map(img => img.image_url).filter(Boolean)
        
        // Delete from storage
        for (const imageUrl of imageUrls) {
          if (imageUrl) {
            const path = imageUrl.split('/').pop()
            if (path) {
              await supabase.storage
                .from('property-images')
                .remove([path])
            }
          }
        }

        // Delete from database
        const { error: imagesError } = await supabase
          .from('property_images')
          .delete()
          .eq('property_id', propertyId)

        if (imagesError) throw imagesError
      }

      // Delete property
      const { error: propertyError } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId)

      if (propertyError) throw propertyError

      // Update local state
      setProperties(prev => prev.filter(p => p.id !== propertyId))
      toast.success('Property deleted successfully')
    } catch (error) {
      console.error('Error deleting property:', error)
      toast.error('Failed to delete property')
    } finally {
      setLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedProperties.length === 0) {
      toast.error('No properties selected')
      return
    }

    try {
      setLoading(true)

      // Delete all selected properties
      const { error } = await supabase
        .from('properties')
        .delete()
        .in('id', selectedProperties)

      if (error) throw error

      // Update local state
      setProperties(prev => prev.filter(p => !selectedProperties.includes(p.id)))
      setSelectedProperties([])
      toast.success(`${selectedProperties.length} properties deleted successfully`)
    } catch (error) {
      console.error('Error bulk deleting properties:', error)
      toast.error('Failed to delete properties')
    } finally {
      setLoading(false)
    }
  }

  const togglePropertySelection = (propertyId: string) => {
    setSelectedProperties(prev =>
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    )
  }

  const selectAllProperties = () => {
    setSelectedProperties(filteredProperties.map(p => p.id))
  }

  const clearSelection = () => {
    setSelectedProperties([])
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getPropertyTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'House': 'bg-blue-100 text-blue-800',
      'Apartment': 'bg-green-100 text-green-800',
      'Commercial': 'bg-purple-100 text-purple-800',
      'Land': 'bg-yellow-100 text-yellow-800',
      'Villa': 'bg-pink-100 text-pink-800',
      'Penthouse': 'bg-indigo-100 text-indigo-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const getCollectionColor = (collection: string) => {
    const colors: { [key: string]: string } = {
      'Featured': 'bg-orange-100 text-orange-800',
      'Premium': 'bg-purple-100 text-purple-800',
      'Standard': 'bg-blue-100 text-blue-800',
      'Economy': 'bg-green-100 text-green-800'
    }
    return colors[collection] || 'bg-gray-100 text-gray-800'
  }

  const propertyTypes = Array.from(new Set(properties.map(p => p.property_type))).filter((type): type is string => Boolean(type))
  const collections = Array.from(new Set(properties.map(p => p.property_collection))).filter((collection): collection is string => Boolean(collection))
  const statuses = Array.from(new Set(properties.map(p => p.status))).filter((status): status is string => Boolean(status))

  const clearFilters = () => {
    setSearchTerm('')
    setFilterType('all')
    setFilterCollection('all')
    setFilterStatus('all')
    setFilterVerified('all')
    setMinPrice('')
    setMaxPrice('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PropertiesHeader currentView={currentView} setCurrentView={setCurrentView} />

      {currentView === 'analytics' ? (
        // Analytics View
        <div className="space-y-6">
          <PropertiesStats properties={properties} filteredProperties={filteredProperties} />
          <PropertiesAnalytics properties={properties} />
        </div>
      ) : (
        // Properties View
        <>
          {/* Combined Filters, Sorting, and Selection */}
          <PropertiesTabs
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterType={filterType}
            setFilterType={setFilterType}
            filterCollection={filterCollection}
            setFilterCollection={setFilterCollection}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterVerified={filterVerified}
            setFilterVerified={setFilterVerified}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            viewMode={viewMode}
            setViewMode={setViewMode}
            propertyTypes={propertyTypes}
            collections={collections}
            statuses={statuses}
            clearFilters={clearFilters}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            selectedProperties={selectedProperties}
            filteredProperties={filteredProperties}
            selectAllProperties={selectAllProperties}
            clearSelection={clearSelection}
            handleBulkDelete={handleBulkDelete}
          />

          {/* Properties Grid/List */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-48 w-full mb-4" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProperties.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No properties found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterType !== 'all' || filterCollection !== 'all'
                    ? 'Try adjusting your filters or search terms.'
                    : 'Get started by adding your first property.'}
                </p>
                <Button onClick={() => router.push('/admin/properties/add')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  viewMode={viewMode}
                  isSelected={selectedProperties.includes(property.id)}
                  onToggleSelection={togglePropertySelection}
                  onDelete={handleDelete}
                  getPropertyTypeColor={getPropertyTypeColor}
                  getCollectionColor={getCollectionColor}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
} 