'use client'

import { useAnalytics } from '@/hooks/useAnalytics'

interface PropertyTrackingExampleProps {
  propertyId: string
  propertyTitle: string
}

export function PropertyTrackingExample({ propertyId, propertyTitle }: PropertyTrackingExampleProps) {
  const { trackPropertyInteraction } = useAnalytics()

  const handleViewImages = () => {
    trackPropertyInteraction('view_images', propertyId, { label: 'Property Images' })
  }

  const handleContactAgent = () => {
    trackPropertyInteraction('contact_agent', propertyId, { label: 'Contact Agent' })
  }

  const handleAddToFavorites = () => {
    trackPropertyInteraction('add_to_favorites', propertyId, { label: 'Add to Favorites' })
  }

  const handleShareProperty = () => {
    trackPropertyInteraction('share_property', propertyId, { label: 'Share Property' })
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Property Tracking Example</h3>
      <p className="text-sm text-gray-600">Property: {propertyTitle}</p>
      
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleViewImages}
          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          View Images
        </button>
        
        <button
          onClick={handleContactAgent}
          className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Contact Agent
        </button>
        
        <button
          onClick={handleAddToFavorites}
          className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Add to Favorites
        </button>
        
        <button
          onClick={handleShareProperty}
          className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Share Property
        </button>
      </div>
      
      <p className="text-xs text-gray-500">
        These buttons demonstrate property interaction tracking. Check your analytics dashboard to see the events.
      </p>
    </div>
  )
}
