"use client"

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { PublicListing } from '@/types/public-listing'
import { MobilePublicListingCard } from '@/components/mobile/public-listings/MobilePublicListingCard'
import { ArrowLeft } from 'lucide-react'
import { HydrationSuppressor } from '@/components/HydrationSuppressor'

interface MobilePublicListingsClientProps {
  initialListings?: PublicListing[]
}

export default function MobilePublicListingsClient({ initialListings = [] }: MobilePublicListingsClientProps) {
  const [listings] = useState<PublicListing[]>(initialListings)
  const filteredListings = listings

  return (
    <HydrationSuppressor>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
          <div className="flex items-center gap-4 px-4 py-4">
            <button 
              onClick={() => window.history.back()}
              className="p-2 rounded-xl hover:bg-gray-100/80 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Public Listings</h1>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 px-4 py-6">
          {filteredListings.length === 0 ? (
            <Card className="border-gray-200">
              <CardContent className="p-8 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No public listings available
                  </h3>
                  <p className="text-gray-600">
                    Check back soon for the latest announcements and updates!
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredListings.map((listing) => (
                <MobilePublicListingCard
                  key={listing.id}
                  listing={listing}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </HydrationSuppressor>
  )
}
