'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Building2, 
  MapPin, 
  Bed, 
  Bath, 
  Square,
  Search,
  Grid3X3,
  List,
  Edit,
  User,
  Calendar,
  RefreshCw
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatIndianPrice, formatIndianNumber } from '@/lib/utils'
import { createSupabaseClient } from '@/lib/supabaseClient'

interface Property {
  id: string
  title: string
  description: string
  price: number
  property_type: string
  property_nature: string
  property_collection: string
  location: string
  location_id?: string
  latitude?: number
  longitude?: number
  thumbnail_url?: string | null
  bhk: number
  area: number
  bedrooms: number
  bathrooms: number
  ready_by: string
  floor_plan_url?: string | null
  brochure_url?: string | null
  created_at: string
  updated_at: string
  status: string
  rera_number?: string | null
  is_verified: boolean
  posted_by?: string
  created_by?: string
  developer_id?: string
  developer_name?: string | null
  developer_logo?: string | null
  location_name?: string | null
  creator_name?: string | null
  creator_email?: string | null
  view_count: number
  favorite_count: number
  review_count: number
  average_rating: number
  total_configurations: number
  total_images: number
}

interface PendingPropertiesClientProps {
  properties: Property[]
}

function PendingPropertiesHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Clock className="h-6 w-6 text-orange-500" />
          Pending Properties
        </h1>
        <p className="text-muted-foreground">
          Review and approve properties submitted by users and sellers.
        </p>
      </div>
    </div>
  )
}

function PendingPropertyCard({ 
  property, 
  onApprove, 
  onReject, 
  isProcessing,
  isSelected,
  onSelect
}: { 
  property: Property
  onApprove: (id: string) => void
  onReject: (id: string) => void
  isProcessing: boolean
  isSelected: boolean
  onSelect: (id: string) => void
}) {
  const getPropertyTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'House': 'bg-blue-100 text-blue-800',
      'Apartment': 'bg-green-100 text-green-800',
      'Commercial': 'bg-purple-100 text-purple-800',
      'Land': 'bg-yellow-100 text-yellow-800',
      'Villa': 'bg-red-100 text-red-800',
      'Penthouse': 'bg-indigo-100 text-indigo-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const getNatureColor = (nature: string) => {
    return nature === 'Sell' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Card className={`overflow-hidden ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <CardContent className="p-0">
        <div className="relative">
          {/* Property Image */}
          <div className="aspect-video relative bg-gray-100">
            {property.thumbnail_url ? (
              <Image
                src={property.thumbnail_url}
                alt={property.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Building2 className="h-12 w-12 text-gray-400" />
              </div>
            )}
            
            {/* Checkbox for bulk selection */}
            <div className="absolute top-3 left-3">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(property.id)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
            </div>

            {/* Status Badge */}
            <div className="absolute top-3 right-3">
              <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                <Clock className="h-3 w-3 mr-1" />
                Pending
              </Badge>
            </div>

            {/* Posted By Badge */}
            <div className="absolute bottom-3 left-3">
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                <User className="h-3 w-3 mr-1" />
                {property.creator_name || property.posted_by || 'Unknown'}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                  {property.title}
                </h3>
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.location_name || property.location}
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="text-xl font-bold text-primary mb-3">
              ₹{formatIndianPrice(property.price)}
            </div>

            {/* Property Details - Simplified */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center">
                <Bed className="h-4 w-4 mr-1" />
                {property.bedrooms}
              </div>
              <div className="flex items-center">
                <Bath className="h-4 w-4 mr-1" />
                {property.bathrooms}
              </div>
              <div className="flex items-center">
                <Square className="h-4 w-4 mr-1" />
                {formatIndianNumber(property.area)}
              </div>
            </div>

            {/* Badges - Simplified */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className={getPropertyTypeColor(property.property_type)}>
                {property.property_type}
              </Badge>
              <Badge className={getNatureColor(property.property_nature)}>
                {property.property_nature}
              </Badge>
              {property.developer_name && (
                <Badge className="bg-purple-100 text-purple-800">
                  {property.developer_name}
                </Badge>
              )}
            </div>

            {/* Submission Info - Simplified */}
            <div className="text-xs text-muted-foreground mb-4 p-2 bg-gray-50 rounded">
              <div className="flex items-center justify-between">
                <span>Submitted: {formatDate(property.created_at)}</span>
                <span>{property.total_configurations} configs</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="flex-1"
              >
                <Link href={`/admin/properties/${property.id}/view`}>
                  <Eye className="h-4 w-4 mr-2" />
                  Review
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="flex-1"
              >
                <Link href={`/admin/properties/${property.id}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
            </div>

            {/* Approve/Reject Buttons */}
            <div className="flex gap-2 mt-3">
              <Button
                onClick={() => onApprove(property.id)}
                disabled={isProcessing}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                onClick={() => onReject(property.id)}
                disabled={isProcessing}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function PendingPropertiesClient({ properties }: PendingPropertiesClientProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isProcessing, setIsProcessing] = useState(false)
  const [filterType, setFilterType] = useState('All')
  const [filterCollection, setFilterCollection] = useState('All')
  const [filterNature, setFilterNature] = useState('All')
  const [selectedProperties, setSelectedProperties] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)

  const supabase = createSupabaseClient()

  // Filter properties based on search and filters
  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           property.posted_by?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           property.creator_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (property.creator_email && property.creator_email.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesType = filterType === 'All' || property.property_type === filterType
      const matchesCollection = filterCollection === 'All' || property.property_collection === filterCollection
      const matchesNature = filterNature === 'All' || property.property_nature === filterNature
      
      return matchesSearch && matchesType && matchesCollection && matchesNature
    })
  }, [properties, searchTerm, filterType, filterCollection, filterNature])

  // Pagination logic
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProperties = filteredProperties.slice(startIndex, endIndex)

  // Bulk action handlers
  const handleSelectAll = () => {
    if (selectedProperties.length === paginatedProperties.length) {
      setSelectedProperties([])
    } else {
      setSelectedProperties(paginatedProperties.map(p => p.id))
    }
  }

  const handleSelectProperty = (propertyId: string) => {
    setSelectedProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    )
  }

  const handleBulkApprove = async () => {
    if (selectedProperties.length === 0) {
      toast.error('Please select properties to approve')
      return
    }

    setIsProcessing(true)
    try {
      const { error } = await supabase
        .from('properties')
        .update({ 
          status: 'active', 
          is_verified: true,
          verified_at: new Date().toISOString()
        })
        .in('id', selectedProperties)

      if (error) {
        toast.error('Failed to approve properties')
        console.error('Error bulk approving properties:', error)
      } else {
        toast.success(`${selectedProperties.length} properties approved successfully`)
        setSelectedProperties([])
        router.refresh()
      }
    } catch (error) {
      toast.error('Failed to approve properties')
      console.error('Error bulk approving properties:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkReject = async () => {
    if (selectedProperties.length === 0) {
      toast.error('Please select properties to reject')
      return
    }

    setIsProcessing(true)
    try {
      const { error } = await supabase
        .from('properties')
        .update({ 
          status: 'inactive',
          is_verified: false
        })
        .in('id', selectedProperties)

      if (error) {
        toast.error('Failed to reject properties')
        console.error('Error bulk rejecting properties:', error)
      } else {
        toast.success(`${selectedProperties.length} properties rejected successfully`)
        setSelectedProperties([])
        router.refresh()
      }
    } catch (error) {
      toast.error('Failed to reject properties')
      console.error('Error bulk rejecting properties:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleApprove = async (propertyId: string) => {
    setIsProcessing(true)
    try {
      const { error } = await supabase
        .from('properties')
        .update({ 
          status: 'active', 
          is_verified: true,
          verified_at: new Date().toISOString()
        })
        .eq('id', propertyId)

      if (error) {
        toast.error('Failed to approve property')
        console.error('Error approving property:', error)
      } else {
        toast.success('Property approved successfully')
        router.refresh()
      }
    } catch (error) {
      toast.error('Failed to approve property')
      console.error('Error approving property:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async (propertyId: string) => {
    setIsProcessing(true)
    try {
      const { error } = await supabase
        .from('properties')
        .update({ 
          status: 'inactive',
          is_verified: false
        })
        .eq('id', propertyId)

      if (error) {
        toast.error('Failed to reject property')
        console.error('Error rejecting property:', error)
      } else {
        toast.success('Property rejected successfully')
        router.refresh()
      }
    } catch (error) {
      toast.error('Failed to reject property')
      console.error('Error rejecting property:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const propertyTypes = ['All', ...Array.from(new Set(properties.map(p => p.property_type)))]
  const collections = ['All', ...Array.from(new Set(properties.map(p => p.property_collection)))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <PendingPropertiesHeader />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pending</p>
                <p className="text-2xl font-bold">{properties.length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">From Users</p>
                <p className="text-2xl font-bold">
                  {properties.filter(p => p.creator_name && !p.developer_name).length}
                </p>
              </div>
              <User className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">From Developers</p>
                <p className="text-2xl font-bold">
                  {properties.filter(p => p.developer_name).length}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Wait Time</p>
                <p className="text-2xl font-bold">
                  {properties.length > 0 ? 
                    Math.round(properties.reduce((acc, p) => {
                      const days = (Date.now() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24)
                      return acc + days
                    }, 0) / properties.length) : 0
                  }d
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search properties, locations, or posted by..."
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
                className="px-3 py-2 border border-input rounded-md text-sm"
              >
                {propertyTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <select
                value={filterNature}
                onChange={(e) => setFilterNature(e.target.value)}
                className="px-3 py-2 border border-input rounded-md text-sm"
              >
                {['All', 'Sell', 'Rent'].map(nature => (
                  <option key={nature} value={nature}>{nature}</option>
                ))}
              </select>
              <select
                value={filterCollection}
                onChange={(e) => setFilterCollection(e.target.value)}
                className="px-3 py-2 border border-input rounded-md text-sm"
              >
                {collections.map(collection => (
                  <option key={collection} value={collection}>{collection}</option>
                ))}
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.refresh()}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedProperties.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedProperties.length} property{selectedProperties.length !== 1 ? 'ies' : 'y'} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProperties([])}
                  className="text-blue-700 border-blue-300"
                >
                  Clear Selection
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleBulkApprove}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve All
                </Button>
                <Button
                  onClick={handleBulkReject}
                  disabled={isProcessing}
                  variant="destructive"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Properties Grid/List */}
      {paginatedProperties.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No pending properties</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterType !== 'All' || filterCollection !== 'All' || filterNature !== 'All'
                ? 'No pending properties match your current filters.'
                : 'No properties are currently pending approval.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Select All and Results Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedProperties.length === paginatedProperties.length && paginatedProperties.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                Select All
              </label>
              <span className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredProperties.length)} of {filteredProperties.length} properties
              </span>
            </div>
          </div>

          {/* Properties Grid */}
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
            {paginatedProperties.map((property) => (
              <PendingPropertyCard
                key={property.id}
                property={property}
                onApprove={handleApprove}
                onReject={handleReject}
                isProcessing={isProcessing}
                isSelected={selectedProperties.includes(property.id)}
                onSelect={handleSelectProperty}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      )
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
} 