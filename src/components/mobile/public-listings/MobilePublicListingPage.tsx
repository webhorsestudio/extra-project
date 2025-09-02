'use client'

import { PublicListing } from '@/types/public-listing'
import { PublicListingContentRenderer } from '@/components/web/public-listings/PublicListingContentRenderer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, Clock, Share2, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface MobilePublicListingPageProps {
  listing: PublicListing
}

export function MobilePublicListingPage({ listing }: MobilePublicListingPageProps) {
  const router = useRouter()

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

  const handleShare = async () => {
    const shareData = {
      title: listing.title,
      text: listing.excerpt || `Check out this listing: ${listing.title}`,
      url: window.location.href
    }

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log('Error sharing:', error)
        fallbackShare()
      }
    } else {
      fallbackShare()
    }
  }

  const fallbackShare = () => {
    // Copy URL to clipboard
    navigator.clipboard.writeText(window.location.href).then(() => {
      // You could add a toast notification here
      alert('Link copied to clipboard!')
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = window.location.href
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('Link copied to clipboard!')
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="p-2 -ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        <Card className="shadow-lg border-0 overflow-hidden">
          <CardContent className="p-0">
            {/* Featured Image */}
            {listing.featured_image_url && (
              <div className="relative">
                <img
                  src={listing.featured_image_url}
                  alt={listing.title}
                  className="w-full h-56 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            )}

            {/* Article Header */}
            <div className="p-6 pb-4">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                  {listing.type.replace('_', ' ').toUpperCase()}
                </Badge>
                <Badge variant="outline" className="text-gray-600 text-xs">
                  <Eye className="w-3 h-3 mr-1" />
                  Public Listing
                </Badge>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                {listing.title}
              </h1>

              {/* Meta Information */}
              <div className="space-y-2 text-sm text-gray-600 mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Published {formatDate(listing.created_at)}</span>
                </div>
                {listing.publish_date && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Scheduled: {formatDateTime(listing.publish_date)}</span>
                  </div>
                )}
                {listing.expire_date && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Expires: {formatDateTime(listing.expire_date)}</span>
                  </div>
                )}
              </div>

              {/* Excerpt */}
              {listing.excerpt && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-500">
                  <p className="text-gray-700 leading-relaxed font-medium">
                    {listing.excerpt}
                  </p>
                </div>
              )}
            </div>

            {/* Article Content */}
            <div className="px-6 pb-6">
              <div className="prose prose-sm prose-gray max-w-none">
                <PublicListingContentRenderer content={listing.content} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="w-full flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Listings
          </Button>
          <Button 
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4" />
            Share This Listing
          </Button>
        </div>
      </div>
    </div>
  )
}
