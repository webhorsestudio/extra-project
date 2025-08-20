'use client'

import { PublicListing, PUBLIC_LISTING_STATUSES, PUBLIC_LISTING_TYPES } from '@/types/public-listing'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  Clock,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

interface PublicListingCardProps {
  listing: PublicListing
  onEdit: (listing: PublicListing) => void
  onDelete: (listing: PublicListing) => void
  onView: (listing: PublicListing) => void
  onReorder?: (listing: PublicListing, direction: 'up' | 'down') => void
  showReorderButtons?: boolean
}

export function PublicListingCard({ 
  listing, 
  onEdit, 
  onDelete, 
  onView,
  onReorder,
  showReorderButtons = false
}: PublicListingCardProps) {
  const statusInfo = PUBLIC_LISTING_STATUSES.find(s => s.value === listing.status)
  const typeInfo = PUBLIC_LISTING_TYPES.find(t => t.value === listing.type)

  const isExpired = listing.expire_date && new Date(listing.expire_date) < new Date()
  const isScheduled = listing.publish_date && new Date(listing.publish_date) > new Date()

  return (
    <Card className="hover:shadow-md transition-shadow h-full">
      <CardHeader className="pb-3">
        <div className="space-y-3">
          {/* Title and URL */}
          <div className="min-w-0">
            <CardTitle className="text-lg font-semibold break-words leading-tight">
              {listing.title}
            </CardTitle>
            <CardDescription className="text-sm font-mono break-all">
              /{listing.slug}
            </CardDescription>
          </div>
          
          {/* Status and Type badges - now below title/URL */}
          <div className="flex flex-wrap gap-2">
            <Badge className={statusInfo?.color}>
              {statusInfo?.label}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {typeInfo?.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Status indicators */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(listing.created_at).toLocaleDateString()}
            </div>
            {listing.order_index > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs">Order: {listing.order_index}</span>
              </div>
            )}
          </div>

          {/* Date indicators */}
          {(listing.publish_date || listing.expire_date) && (
            <div className="flex flex-wrap gap-2 text-xs">
              {listing.publish_date && (
                <Badge variant={isScheduled ? "secondary" : "outline"} className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {isScheduled ? 'Scheduled' : 'Published'}: {new Date(listing.publish_date).toLocaleDateString()}
                </Badge>
              )}
              {listing.expire_date && (
                <Badge variant={isExpired ? "destructive" : "outline"} className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {isExpired ? 'Expired' : 'Expires'}: {new Date(listing.expire_date).toLocaleDateString()}
                </Badge>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(listing)}
              className="flex-1 min-w-0"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(listing)}
              className="shrink-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
            {showReorderButtons && onReorder && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReorder(listing, 'up')}
                  title="Move up"
                  className="shrink-0"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReorder(listing, 'down')}
                  title="Move down"
                  className="shrink-0"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(listing)}
              className="shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
