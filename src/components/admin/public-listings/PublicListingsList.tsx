'use client'

import { useState, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Plus, 
  RefreshCw,
  FileText,
  BarChart3
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { PublicListing } from '@/types/public-listing'
import { PublicListingCard } from './PublicListingCard'
import { PublicListingFilters } from './PublicListingFilters'
import { DeletePublicListingDialog } from './DeletePublicListingDialog'

interface PublicListingsListProps {
  initialListings?: PublicListing[]
}

export default function PublicListingsList({ initialListings = [] }: PublicListingsListProps) {
  const [listings, setListings] = useState<PublicListing[]>(initialListings)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [listingToDelete, setListingToDelete] = useState<PublicListing | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleDelete = async (listing: PublicListing) => {
    setListingToDelete(listing)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!listingToDelete) return

    try {
      const response = await fetch(`/api/admin/public-listings/${listingToDelete.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete listing')
      }

      toast({
        title: 'Success',
        description: 'Public listing deleted successfully',
      })
      
      // Remove the deleted listing from the local state
      setListings(prev => prev.filter(l => l.id !== listingToDelete.id))
    } catch (error) {
      console.error('Error deleting listing:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete listing',
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
      setListingToDelete(null)
    }
  }

  const handleRefresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (typeFilter) params.append('type', typeFilter)
      if (statusFilter) params.append('status', statusFilter)

      const response = await fetch(`/api/admin/public-listings?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch listings')
      
      const data = await response.json()
      setListings(data.listings || [])
    } catch (error) {
      console.error('Error refreshing listings:', error)
      toast({
        title: 'Error',
        description: 'Failed to refresh listings',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, typeFilter, statusFilter, toast])

  const handleReorder = async (listing: PublicListing, direction: 'up' | 'down') => {
    try {
      const currentIndex = listing.order_index
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
      
      const response = await fetch(`/api/admin/public-listings/${listing.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order_index: newIndex }),
      })

      if (!response.ok) {
        throw new Error('Failed to reorder listing')
      }

      const { listing: updatedListing } = await response.json()
      
      setListings(prev => prev.map(l => 
        l.id === listing.id ? updatedListing : l
      ))

      toast({
        title: 'Success',
        description: 'Listing order updated successfully',
      })
    } catch (error) {
      console.error('Error reordering listing:', error)
      toast({
        title: 'Error',
        description: 'Failed to reorder listing',
        variant: 'destructive',
      })
    }
  }

  const filteredListings = listings.filter(listing => {
    const matchesSearch = !searchTerm || 
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = !typeFilter || listing.type === typeFilter
    const matchesStatus = !statusFilter || listing.status === statusFilter
    
    return matchesSearch && matchesType && matchesStatus
  })

  const handleClearFilters = () => {
    setSearchTerm('')
    setTypeFilter('')
    setStatusFilter('')
  }

  // Calculate stats
  const stats = {
    total: listings.length,
    published: listings.filter(l => l.status === 'published').length,
    draft: listings.filter(l => l.status === 'draft').length,
    archived: listings.filter(l => l.status === 'archived').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Public Listings</h1>
          <p className="text-muted-foreground">
            Manage featured content, announcements, and public-facing listings
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={() => router.push('/admin/frontend-ui/public-listings/new')} 
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Listing
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-2xl font-bold text-green-600">{stats.published}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Draft</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.draft}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Archived</p>
                <p className="text-2xl font-bold text-gray-600">{stats.archived}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <PublicListingFilters
        searchTerm={searchTerm}
        typeFilter={typeFilter}
        statusFilter={statusFilter}
        onSearchChange={setSearchTerm}
        onTypeChange={setTypeFilter}
        onStatusChange={setStatusFilter}
        onClearFilters={handleClearFilters}
      />

      {/* Results Count */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{filteredListings.length} listings</span>
        {(searchTerm || typeFilter || statusFilter) && (
          <>
            <span>•</span>
            <span>Filtered from {listings.length} total</span>
          </>
        )}
      </div>

      {/* Listings Grid */}
      {filteredListings.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm || typeFilter || statusFilter ? 'No listings found' : 'No listings yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || typeFilter || statusFilter
                ? 'Try adjusting your search terms or filters' 
                : 'Get started by creating your first public listing'
              }
            </p>
            {!(searchTerm || typeFilter || statusFilter) && (
              <Button onClick={() => router.push('/admin/frontend-ui/public-listings/new')}>
                Create Your First Listing
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <PublicListingCard
              key={listing.id}
              listing={listing}
              onEdit={(listing) => router.push(`/admin/frontend-ui/public-listings/${listing.id}`)}
              onDelete={handleDelete}
              onView={(listing) => router.push(`/admin/frontend-ui/public-listings/${listing.id}/preview`)}
              onReorder={handleReorder}
              showReorderButtons={!typeFilter && !statusFilter && !searchTerm}
            />
          ))}
        </div>
      )}

      {/* Delete Dialog */}
      <DeletePublicListingDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        listing={listingToDelete}
      />
    </div>
  )
}
