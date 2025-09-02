'use client'

import { PublicListing } from '@/types/public-listing'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface MobilePublicListingCardProps {
  listing: PublicListing
}

export function MobilePublicListingCard({ listing }: MobilePublicListingCardProps) {
  const router = useRouter()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleViewFullListing = () => {
    router.push(`/m/public-listings/${listing.slug}`)
  }

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-gray-200">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Title */}
            <div className="space-y-2">
              <CardTitle className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors break-words leading-tight">
                {listing.title}
              </CardTitle>
            </div>

            {/* Date Information */}
            <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(listing.created_at)}</span>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full h-10 text-sm border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                onClick={handleViewFullListing}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Full Listing
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
