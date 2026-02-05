'use client'

import { useState } from 'react'
import { useAnalytics } from '@/hooks/useAnalytics'

export function FormTrackingExample() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { trackFormSubmission, trackEvent } = useAnalytics()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Track form field interactions
    trackEvent('form_field_interaction', {
      category: 'form',
      label: `field_${name}`,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Track successful form submission
      trackFormSubmission('contact_form', true)
      
      // Track additional event with form data
      trackEvent('form_submit_complete', {
        category: 'form',
        label: 'contact_form',
        value: 1,
      })
      
      // Reset form
      setFormData({ name: '', email: '', message: '' })
      alert('Form submitted successfully! Check your analytics dashboard.')
      
    } catch {
      // Track failed form submission
      trackFormSubmission('contact_form', false)
      alert('Form submission failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Form Tracking Example</h3>
      <p className="text-sm text-gray-600">
        This form demonstrates form submission tracking. Fill it out and submit to see tracking in action.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Form'}
        </button>
      </form>
      
      <p className="text-xs text-gray-500">
        This form tracks: field interactions, successful submissions, and failed submissions.
        Check your analytics dashboard to see the events.
      </p>
    </div>
  )
}
