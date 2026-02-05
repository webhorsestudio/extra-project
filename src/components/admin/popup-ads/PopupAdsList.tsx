'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PopupAd, PopupAdType, PopupAdStatus } from '@/types/popup-ad'
import { Plus, Search, Zap, Eye } from 'lucide-react'
import { PopupAdCard } from './PopupAdCard'
import { DeletePopupAdDialog } from './DeletePopupAdDialog'

interface PopupAdsListProps {
  initialPopupAds: PopupAd[]
}

export default function PopupAdsList({ initialPopupAds }: PopupAdsListProps) {
  const [popupAds, setPopupAds] = useState<PopupAd[]>(initialPopupAds)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<PopupAdType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<PopupAdStatus | 'all'>('all')
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | 'all'>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [popupAdToDelete, setPopupAdToDelete] = useState<PopupAd | null>(null)
  
  const router = useRouter()

  // Filter popup ads based on search and filters
  const filteredPopupAds = popupAds.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ad.slug.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === 'all' || ad.type === typeFilter
    const matchesStatus = statusFilter === 'all' || ad.status === statusFilter
    const matchesActive = isActiveFilter === 'all' || ad.is_active === isActiveFilter

    return matchesSearch && matchesType && matchesStatus && matchesActive
  })

  const handleDelete = (popupAd: PopupAd) => {
    setPopupAdToDelete(popupAd)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!popupAdToDelete) return

    try {
      const response = await fetch(`/api/admin/popup-ads/${popupAdToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPopupAds(prev => prev.filter(ad => ad.id !== popupAdToDelete.id))
        setDeleteDialogOpen(false)
        setPopupAdToDelete(null)
      } else {
        console.error('Failed to delete popup ad')
      }
    } catch (error) {
      console.error('Error deleting popup ad:', error)
    }
  }



  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={() => router.push('/admin/frontend-ui/popup-ads/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Popup Ad
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            {popupAds.length} Total
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {popupAds.filter(ad => ad.status === 'published').length} Published
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search popup ads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as PopupAdType | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="banner">Banner</SelectItem>
                  <SelectItem value="modal">Modal</SelectItem>
                  <SelectItem value="toast">Toast</SelectItem>
                  <SelectItem value="slide_in">Slide In</SelectItem>
                  <SelectItem value="fullscreen">Fullscreen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as PopupAdStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Active</label>
              <Select value={isActiveFilter.toString()} onValueChange={(value) => setIsActiveFilter(value === 'all' ? 'all' : value === 'true')}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Popup Ads Grid */}
      {filteredPopupAds.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="max-w-md mx-auto">
              <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No popup ads found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' || isActiveFilter !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'Get started by creating your first popup ad.'}
              </p>
              {!searchTerm && typeFilter === 'all' && statusFilter === 'all' && isActiveFilter === 'all' && (
                <Button onClick={() => router.push('/admin/frontend-ui/popup-ads/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Popup Ad
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPopupAds.map((popupAd) => (
            <PopupAdCard
              key={popupAd.id}
              popupAd={popupAd}
              onEdit={() => router.push(`/admin/frontend-ui/popup-ads/${popupAd.id}`)}
              onDelete={() => handleDelete(popupAd)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeletePopupAdDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setPopupAdToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        popupAd={popupAdToDelete}
      />
    </div>
  )
}
