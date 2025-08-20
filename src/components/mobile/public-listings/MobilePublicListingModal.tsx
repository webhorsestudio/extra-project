'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, X } from 'lucide-react'
import { PublicListing, PUBLIC_LISTING_STATUSES, PUBLIC_LISTING_TYPES } from '@/types/public-listing'
import { PublicListingContentRenderer } from '@/components/web/public-listings/PublicListingContentRenderer'

interface MobilePublicListingModalProps {
  listing: PublicListing | null
  isOpen: boolean
  onClose: () => void
}

export function MobilePublicListingModal({ listing, isOpen, onClose }: MobilePublicListingModalProps) {
  if (!listing) return null

  const statusInfo = PUBLIC_LISTING_STATUSES.find(s => s.value === listing.status)
  const typeInfo = PUBLIC_LISTING_TYPES.find(t => t.value === listing.type)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-4 pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <DialogTitle className="text-xl font-bold text-gray-900 leading-tight">
                {listing.title}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {typeInfo?.label}
                </Badge>
                <Badge className={`${statusInfo?.color} text-xs`}>
                  {statusInfo?.label}
                </Badge>
                {listing.order_index > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    #{listing.order_index}
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="px-4 pb-4 space-y-4">
          {/* Metadata */}
          <div className="grid grid-cols-1 gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Created: {formatDate(listing.created_at)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Updated: {formatDate(listing.updated_at)}</span>
            </div>
            {listing.publish_date && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Published: {formatDateTime(listing.publish_date)}</span>
              </div>
            )}
            {listing.expire_date && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Expires: {formatDateTime(listing.expire_date)}</span>
              </div>
            )}
          </div>

          {/* Excerpt */}
          {listing.excerpt && (
            <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-200">
              <p className="text-gray-700 italic text-sm">{listing.excerpt}</p>
            </div>
          )}

          {/* Featured Image */}
          {listing.featured_image_url && (
            <div className="text-center">
              <img
                src={listing.featured_image_url}
                alt={listing.title}
                className="max-w-full h-auto max-h-64 rounded-lg shadow-md"
              />
            </div>
          )}

          {/* Full Content */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Full Content</h3>
            <div className="bg-white rounded-lg">
              <PublicListingContentRenderer content={listing.content} />
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-center pt-4">
            <Button variant="outline" onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
