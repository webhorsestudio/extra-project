'use client'


import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock } from 'lucide-react'
import { PublicListing, PUBLIC_LISTING_STATUSES, PUBLIC_LISTING_TYPES } from '@/types/public-listing'
import { PublicListingContentRenderer } from './PublicListingContentRenderer'

interface PublicListingModalProps {
  listing: PublicListing | null
  isOpen: boolean
  onClose: () => void
}

export function PublicListingModal({ listing, isOpen, onClose }: PublicListingModalProps) {
  if (!listing) return null

  const statusInfo = PUBLIC_LISTING_STATUSES.find(s => s.value === listing.status)
  const typeInfo = PUBLIC_LISTING_TYPES.find(t => t.value === listing.type)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                 <DialogHeader>
           <div className="flex items-start justify-between">
             <div className="flex-1">
               <DialogTitle className="text-2xl font-bold text-gray-900">
                 {listing.title}
               </DialogTitle>
               <div className="flex items-center gap-2 mt-2">
                 <Badge variant="outline" className="text-sm">
                   {typeInfo?.label}
                 </Badge>
                 <Badge className={`${statusInfo?.color} text-sm`}>
                   {statusInfo?.label}
                 </Badge>
                 {listing.order_index > 0 && (
                   <Badge variant="secondary" className="text-sm">
                     #{listing.order_index}
                   </Badge>
                 )}
               </div>
             </div>
           </div>
         </DialogHeader>

        <div className="space-y-6">
          {/* Meta Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
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
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-200">
              <p className="text-gray-700 italic">{listing.excerpt}</p>
            </div>
          )}

          {/* Featured Image */}
          {listing.featured_image_url && (
            <div className="text-center">
              <img
                src={listing.featured_image_url}
                alt={listing.title}
                className="max-w-full h-auto max-h-96 rounded-lg shadow-md"
              />
            </div>
          )}

          {/* Main Content */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Full Content</h3>
            <div className="bg-white rounded-lg">
              <PublicListingContentRenderer content={listing.content} />
            </div>
          </div>

                     {/* Footer Actions */}
           <div className="flex justify-end pt-4 border-t">
             <Button variant="outline" onClick={onClose}>
               Close
             </Button>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
