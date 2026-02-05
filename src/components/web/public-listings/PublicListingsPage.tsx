'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'

import { PublicListing } from '@/types/public-listing'
import { PublicListingCard } from './PublicListingCard'

interface PublicListingsPageProps {
  initialListings?: PublicListing[]
}

export default function PublicListingsPage({ initialListings = [] }: PublicListingsPageProps) {
  const [listings] = useState<PublicListing[]>(initialListings)
  const filteredListings = listings



  return (
    <div className="space-y-8 px-6 sm:px-8 lg:px-12 xl:px-16">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Public Listings
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover the latest announcements, updates, and featured content from our community.
        </p>
      </div>

      {/* Listings Grid */}
      {filteredListings.length === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="p-16 text-center">
            <div className="max-w-md mx-auto">
                          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                No public listings available
              </h3>
              <p className="text-gray-600 mb-6">
                Check back soon for the latest announcements and updates!
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <PublicListingCard
              key={listing.id}
              listing={listing}
            />
          ))}
        </div>
      )}
    </div>
  )
}
