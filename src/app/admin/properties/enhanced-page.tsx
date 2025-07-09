'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Eye, 
  Plus, 
  Building2, 
  MapPin, 
  Bed, 
  Bath, 
  Square,
  Search,
  Filter,
  Grid3X3,
  List,
  Edit,
  TrendingUp,
  Star,
  Heart,
  Users,
  CheckCircle,
  RefreshCw,
  DollarSign,
  Target
} from 'lucide-react'
import Image from 'next/image'
import { formatIndianPrice, formatIndianNumber } from '@/lib/utils'

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
  // New fields from relationships
  view_count?: number
  favorite_count?: number
  review_count?: number
  average_rating?: number
  is_verified?: boolean
  property_collection?: string
}

export default function EnhancedPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('newest')
  const router = useRouter()

  useEffect(() => {
    fetchProperties()
  }, [])

  const filterAndSortProperties = useCallback(() => {
    let filtered = properties

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.property_type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by property type
    if (filterType !== 'all') {
      filtered = filtered.filter(property => property.property_type === filterType)
    }

    // Sort properties
    switch (sortBy) {
      case 'newest':
        filtered = filtered.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
        break
      case 'oldest':
        filtered = filtered.sort((a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime())
        break
      case 'price-high':
        filtered = filtered.sort((a, b) => b.price - a.price)
        break
      case 'price-low':
        filtered = filtered.sort((a, b) => a.price - b.price)
        break
      case 'name':
        filtered = filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'views':
        filtered = filtered.sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
        break
      case 'favorites':
        filtered = filtered.sort((a, b) => (b.favorite_count || 0) - (a.favorite_count || 0))
        break
      case 'rating':
        filtered = filtered.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
        break
    }

    setFilteredProperties(filtered)
  }, [properties, searchTerm, filterType, sortBy])

  useEffect(() => {
    filterAndSortProperties()
  }, [filterAndSortProperties])

  const fetchProperties = async () => {
    try {
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select(`
          id,
          title,
          property_type,
          property_collection,
          location,
          created_at,
          rera_number,
          is_verified,
          property_images (
            image_url
          ),
          property_configurations (
            price,
            bhk,
            area,
            bedrooms,
            bathrooms
          ),
          property_views (
            id
          ),
          property_favorites (
            id
          ),
          property_reviews (
            id,
            rating
          )
        `)
        .order('created_at', { ascending: false })

      if (propertiesError) throw propertiesError

      const transformedProperties = propertiesData.map(property => {
        const firstConfig = property.property_configurations?.[0]
        const viewCount = property.property_views?.length || 0
        const favoriteCount = property.property_favorites?.length || 0
        const reviewCount = property.property_reviews?.length || 0
        const averageRating = property.property_reviews && property.property_reviews.length > 0
          ? property.property_reviews.reduce((sum, review) => sum + review.rating, 0) / property.property_reviews.length
          : 0

        return {
          id: property.id,
          title: property.title,
          price: firstConfig?.price || 0,
          property_type: property.property_type,
          property_collection: property.property_collection || 'Featured',
          location: property.location,
          thumbnail_url: property.property_images?.[0]?.image_url || null,
          bhk: firstConfig?.bhk || 1,
          area: firstConfig?.area || 0,
          bedrooms: firstConfig?.bedrooms || 1,
          bathrooms: firstConfig?.bathrooms || 1,
          created_at: property.created_at,
          status: 'Active',
          rera_number: property.rera_number,
          is_verified: property.is_verified || false,
          view_count: viewCount,
          favorite_count: favoriteCount,
          review_count: reviewCount,
          average_rating: averageRating,
        }
      })

      setProperties(transformedProperties)
    } catch (error) {
      console.error('Error fetching properties:', error)
      toast.error('Failed to fetch properties')
    } finally {
      setLoading(false)
    }
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
      'House': 'bg-blue-100 text-blue-800 border-blue-200',
      'Apartment': 'bg-green-100 text-green-800 border-green-200',
      'Commercial': 'bg-purple-100 text-purple-800 border-purple-200',
      'Land': 'bg-orange-100 text-orange-800 border-orange-200',
      'Villa': 'bg-pink-100 text-pink-800 border-pink-200',
      'Penthouse': 'bg-indigo-100 text-indigo-800 border-indigo-200'
    }
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getCollectionColor = (collection: string) => {
    const colors: { [key: string]: string } = {
      'Newly Launched': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Featured': 'bg-red-100 text-red-800 border-red-200',
      'Ready to Move': 'bg-green-100 text-green-800 border-green-200',
      'Under Construction': 'bg-blue-100 text-blue-800 border-blue-200'
    }
    return colors[collection] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  // Calculate statistics
  const totalProperties = properties.length
  const activeProperties = properties.filter(p => p.status === 'Active').length
  const totalViews = properties.reduce((sum, p) => sum + (p.view_count || 0), 0)
  const totalFavorites = properties.reduce((sum, p) => sum + (p.favorite_count || 0), 0)
  const verifiedProperties = properties.filter(p => p.is_verified).length
  const avgPrice = properties.length > 0 ? properties.reduce((sum, p) => sum + p.price, 0) / properties.length : 0

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            Properties Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your property listings, track performance, and monitor engagement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={fetchProperties}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => router.push('/admin/properties/add')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Property
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Properties</p>
                <p className="text-2xl font-bold">{totalProperties}</p>
                <p className="text-xs text-muted-foreground">
                  {activeProperties} active • {verifiedProperties} verified
                </p>
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  {totalFavorites} favorites
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Price</p>
                <p className="text-2xl font-bold">{formatIndianPrice(Math.round(avgPrice))}</p>
                <p className="text-xs text-muted-foreground">
                  Across all properties
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Engagement</p>
                <p className="text-2xl font-bold">
                  {totalViews > 0 ? `${((totalFavorites / totalViews) * 100).toFixed(1)}%` : '0%'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Favorites per view
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search properties by title, location, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="all">All Types</option>
                <option value="House">House</option>
                <option value="Apartment">Apartment</option>
                <option value="Commercial">Commercial</option>
                <option value="Land">Land</option>
                <option value="Villa">Villa</option>
                <option value="Penthouse">Penthouse</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
                <option value="name">Name A-Z</option>
                <option value="views">Most Views</option>
                <option value="favorites">Most Favorites</option>
                <option value="rating">Highest Rating</option>
              </select>
              <div className="flex border border-input rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing {filteredProperties.length} of {properties.length} properties</span>
            {(searchTerm || filterType !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('')
                  setFilterType('all')
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Properties Display */}
      {filteredProperties.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchTerm || filterType !== 'all' ? 'No properties found' : 'No properties yet'}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search criteria or filters to find what you\'re looking for.'
                : 'Get started by adding your first property listing to showcase your real estate portfolio.'
              }
            </p>
            {!searchTerm && filterType === 'all' && (
              <Button onClick={() => router.push('/admin/properties/add')} size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Property
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        // Enhanced Grid View
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="relative">
                    <div className="h-48 bg-muted relative overflow-hidden">
                      {property.thumbnail_url ? (
                        <Image
                          src={property.thumbnail_url}
                          alt={property.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Badge className={`${getPropertyTypeColor(property.property_type)} border`}>
                          {property.property_type}
                        </Badge>
                        {property.is_verified && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <Badge className={`${getCollectionColor(property.property_collection || 'Featured')} border`}>
                          {property.property_collection}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {property.location}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xl font-bold text-green-600">
                          {formatIndianPrice(property.price)}
                        </div>
                        <div className="flex items-center gap-1">
                          {property.average_rating ? (
                            <>
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{property.average_rating.toFixed(1)}</span>
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">No rating</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Bed className="h-3 w-3" />
                            {property.bedrooms}
                          </div>
                          <div className="flex items-center gap-1">
                            <Bath className="h-3 w-3" />
                            {property.bathrooms}
                          </div>
                          <div className="flex items-center gap-0.5">
                            <Square className="h-2.5 w-2.5" />
                            <span className="text-xs">{formatIndianNumber(property.area)} sq ft</span>
                          </div>
                        </div>
                      </div>

                      {/* Analytics Row */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {property.view_count || 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {property.favorite_count || 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {property.review_count || 0}
                          </div>
                        </div>
                        <div className="text-xs">
                          {formatDate(property.created_at || '')}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => router.push(`/admin/properties/${property.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => router.push(`/admin/properties/${property.id}`)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 
