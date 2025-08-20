'use client'

import { useState } from 'react'
import { PublicListing } from '@/types/public-listing'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Calendar,
  ExternalLink
} from 'lucide-react'
import { PublicListingModal } from './PublicListingModal'

interface PublicListingCardProps {
  listing: PublicListing
}

export function PublicListingCard({ listing }: PublicListingCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleViewFullListing = () => {
    setIsModalOpen(true)
  }

  return (
    <>
      <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer border-gray-200 h-full">
        {/* Content Section */}
        <CardContent className="p-5">
          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors break-words leading-tight">
                {listing.title}
              </CardTitle>
            </div>



            {/* Date Information */}
            <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-3">
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

      {/* Modal for Full Listing View */}
      <PublicListingModal
        listing={listing}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
