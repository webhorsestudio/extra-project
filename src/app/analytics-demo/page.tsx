import { PropertyTrackingExample } from '@/components/analytics/PropertyTrackingExample'
import { FormTrackingExample } from '@/components/analytics/FormTrackingExample'
import { SearchTrackingExample } from '@/components/analytics/SearchTrackingExample'
import { MetaPixelTrackingExample } from '@/components/analytics/MetaPixelTrackingExample'

export default function AnalyticsDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Analytics & Tracking Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            This page demonstrates the comprehensive analytics and tracking functionality 
            integrated into your property management system. Use the examples below to 
            test different types of tracking events.
          </p>
        </div>

        <div className="space-y-8">
          {/* Property Tracking Example */}
          <PropertyTrackingExample 
            propertyId="demo-property-123"
            propertyTitle="Demo Luxury Villa"
          />

          {/* Form Tracking Example */}
          <FormTrackingExample />

          {/* Search Tracking Example */}
          <SearchTrackingExample />

          {/* Meta Pixel Tracking Example */}
          <MetaPixelTrackingExample />

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              How to Test the Tracking
            </h3>
            <div className="text-blue-800 space-y-2">
              <p>1. <strong>Property Tracking:</strong> Click the property interaction buttons to see property-related events</p>
              <p>2. <strong>Form Tracking:</strong> Fill out and submit the form to see form submission tracking</p>
              <p>3. <strong>Search Tracking:</strong> Enter search terms and click results to see search analytics</p>
              <p>4. <strong>Check Analytics:</strong> Open your browser&apos;s developer tools and look for network requests to Google Analytics</p>
              <p>5. <strong>Real-time Data:</strong> Check your Google Analytics dashboard for real-time event data</p>
            </div>
          </div>

          {/* Technical Details */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Technical Implementation Details
            </h3>
            <div className="text-gray-700 space-y-2 text-sm">
              <p>• <strong>Server-side Scripts:</strong> Google Analytics and GTM scripts are loaded in the root layout</p>
              <p>• <strong>Client-side Tracking:</strong> Custom hooks provide easy-to-use tracking functions</p>
              <p>• <strong>Event Categories:</strong> Events are organized into logical categories (property, form, search, user)</p>
              <p>• <strong>Dynamic Loading:</strong> Tracking scripts only load when IDs are configured in admin settings</p>
              <p>• <strong>Type Safety:</strong> Full TypeScript support with proper type definitions</p>
              <p>• <strong>Performance:</strong> Scripts use Next.js Script component with optimal loading strategies</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
