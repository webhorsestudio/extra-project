'use client'

import { useAnalytics } from '@/hooks/useAnalytics'

export function MetaPixelTrackingExample() {
  const { trackMetaPixelEvent, trackMetaPixelCustomEvent } = useAnalytics()

  const handleStandardEvent = (eventName: string) => {
    trackMetaPixelEvent(eventName)
    alert(`Meta Pixel event "${eventName}" tracked! Check your Facebook Events Manager.`)
  }

  const handleCustomEvent = (eventName: string) => {
    const parameters = {
      content_name: 'Demo Property',
      content_category: 'Real Estate',
      value: 500000,
      currency: 'USD',
      content_ids: ['demo-property-123'],
      content_type: 'product'
    }
    
    trackMetaPixelCustomEvent(eventName, parameters)
    alert(`Meta Pixel custom event "${eventName}" tracked with parameters! Check your Facebook Events Manager.`)
  }

  const handlePropertyView = () => {
    trackMetaPixelEvent('ViewContent', {
      content_name: 'Demo Luxury Villa',
      content_category: 'Real Estate',
      content_ids: ['demo-property-123'],
      content_type: 'product',
      value: 750000,
      currency: 'USD'
    })
    alert('Property view event tracked! Check your Facebook Events Manager.')
  }

  const handleAddToWishlist = () => {
    trackMetaPixelEvent('AddToWishlist', {
      content_name: 'Demo Luxury Villa',
      content_category: 'Real Estate',
      content_ids: ['demo-property-123'],
      content_type: 'product',
      value: 750000,
      currency: 'USD'
    })
    alert('Add to wishlist event tracked! Check your Facebook Events Manager.')
  }

  const handleContactAgent = () => {
    trackMetaPixelEvent('Lead', {
      content_name: 'Demo Luxury Villa',
      content_category: 'Real Estate',
      content_ids: ['demo-property-123'],
      content_type: 'product',
      value: 750000,
      currency: 'USD'
    })
    alert('Lead generation event tracked! Check your Facebook Events Manager.')
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Meta Pixel Tracking Example</h3>
      <p className="text-sm text-gray-600">
        This component demonstrates Meta Pixel tracking functionality. Click the buttons to see tracking in action.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Standard Events */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Standard Events</h4>
          <div className="space-y-2">
            <button
              onClick={() => handleStandardEvent('PageView')}
              className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              Track PageView
            </button>
            <button
              onClick={() => handleStandardEvent('ViewContent')}
              className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            >
              Track ViewContent
            </button>
            <button
              onClick={() => handleStandardEvent('AddToCart')}
              className="w-full px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
            >
              Track AddToCart
            </button>
            <button
              onClick={() => handleStandardEvent('InitiateCheckout')}
              className="w-full px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
            >
              Track InitiateCheckout
            </button>
          </div>
        </div>

        {/* Custom Events */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Custom Events</h4>
          <div className="space-y-2">
            <button
              onClick={() => handleCustomEvent('PropertyView')}
              className="w-full px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-sm"
            >
              Track PropertyView
            </button>
            <button
              onClick={() => handleCustomEvent('AgentContact')}
              className="w-full px-3 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 text-sm"
            >
              Track AgentContact
            </button>
            <button
              onClick={() => handleCustomEvent('PropertySearch')}
              className="w-full px-3 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 text-sm"
            >
              Track PropertySearch
            </button>
            <button
              onClick={() => handleCustomEvent('VirtualTour')}
              className="w-full px-3 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 text-sm"
            >
              Track VirtualTour
            </button>
          </div>
        </div>
      </div>

      {/* Property-Specific Events */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Property-Specific Events</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <button
            onClick={handlePropertyView}
            className="px-3 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 text-sm"
          >
            View Property
          </button>
          <button
            onClick={handleAddToWishlist}
            className="px-3 py-2 bg-rose-500 text-white rounded hover:bg-rose-600 text-sm"
          >
            Add to Wishlist
          </button>
          <button
            onClick={handleContactAgent}
            className="px-3 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 text-sm"
          >
            Contact Agent
          </button>
        </div>
      </div>
      
      <p className="text-xs text-gray-500">
        These events demonstrate Meta Pixel tracking for real estate. Check your Facebook Events Manager 
        and Facebook Ads Manager to see the tracked events and create custom audiences.
      </p>
    </div>
  )
}
