'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { CreatePopupAdData } from '@/types/popup-ad'
import { Save, ArrowLeft } from 'lucide-react'

// Import section components
import BasicInfoSection from './sections/BasicInfoSection'
import ContentMediaSection from './sections/ContentMediaSection'
import DisplaySettingsSection from './sections/DisplaySettingsSection'
import PlatformSettingsSection from './sections/PlatformSettingsSection'
import SchedulingSection from './sections/SchedulingSection'
import PreviewSection from './sections/PreviewSection'

interface PopupAdFormProps {
  popupAdId?: string
}

export default function PopupAdForm({ popupAdId }: PopupAdFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const isEditing = !!popupAdId

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(false)
  const [formData, setFormData] = useState<CreatePopupAdData>({
    title: '',
    slug: '',
    type: 'modal',
    position: 'center',
    content: {
      title: '',
      description: '',
      button_text: ''
    },
    image_url: '',
    link_url: '',
    link_text: '',
    status: 'draft',
    priority: 0,
    display_delay: 0,
    display_duration: 0,
    max_display_count: 0,
    start_date: '',
    end_date: '',
    is_active: true,
    show_on_mobile: true,
    show_on_desktop: true,
    show_on_tablet: true,
    target_pages: [],
    exclude_pages: [],
    user_segments: {},
    conditions: {},
    metadata: {}
  })

  // Load existing data if editing
  useEffect(() => {
    if (isEditing && popupAdId) {
      loadPopupAd(popupAdId)
    }
  }, [isEditing, popupAdId])

  // Ensure form data is always properly initialized
  useEffect(() => {
    if (!formData.content) {
      setFormData(prev => ({
        ...prev,
        content: {
          title: '',
          description: '',
          button_text: ''
        }
      }))
    }
  }, [formData.content])

  const loadPopupAd = async (id: string) => {
    setInitialLoading(true)
    try {
      const response = await fetch(`/api/admin/popup-ads/${id}`)
      
      if (response.ok) {
        const { popupAd } = await response.json()
        
        // Ensure all fields have proper default values and handle null values
        const cleanedData = {
          title: popupAd.title || '',
          slug: popupAd.slug || '',
          type: popupAd.type || 'modal',
          position: popupAd.position || 'center',
          content: {
            title: popupAd.content?.title || '',
            description: popupAd.content?.description || '',
            button_text: popupAd.content?.button_text || ''
          },
          image_url: popupAd.image_url || '',
          link_url: popupAd.link_url || '',
          link_text: popupAd.link_text || '',
          status: popupAd.status || 'draft',
          priority: popupAd.priority || 0,
          display_delay: popupAd.display_delay || 0,
          display_duration: popupAd.display_duration || 0,
          max_display_count: popupAd.max_display_count || 0,
          start_date: popupAd.start_date ? new Date(popupAd.start_date).toISOString().slice(0, 16) : '',
          end_date: popupAd.end_date ? new Date(popupAd.end_date).toISOString().slice(0, 16) : '',
          is_active: popupAd.is_active ?? true,
          show_on_mobile: popupAd.show_on_mobile ?? true,
          show_on_desktop: popupAd.show_on_desktop ?? true,
          show_on_tablet: popupAd.show_on_tablet ?? true,
          target_pages: popupAd.target_pages || [],
          exclude_pages: popupAd.exclude_pages || [],
          user_segments: popupAd.user_segments || {},
          conditions: popupAd.conditions || {},
          metadata: popupAd.metadata || {}
        }
        
        setFormData(cleanedData)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load popup ad data',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error loading popup ad:', error)
      toast({
        title: 'Error',
        description: 'Failed to load popup ad data',
        variant: 'destructive'
      })
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Clean up the data before sending - convert empty strings to undefined for date fields
      const cleanedData = {
        ...formData,
        start_date: formData.start_date && formData.start_date.trim() !== '' ? formData.start_date : undefined,
        end_date: formData.end_date && formData.end_date.trim() !== '' ? formData.end_date : undefined
      }

      const url = isEditing 
        ? `/api/admin/popup-ads/${popupAdId}` 
        : '/api/admin/popup-ads'
      
      const method = isEditing ? 'PUT' : 'POST'
      const body = isEditing ? { ...cleanedData, id: popupAdId } : cleanedData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        const message = isEditing ? 'Popup ad updated successfully' : 'Popup ad created successfully'
        toast({
          title: 'Success',
          description: message,
        })
        router.push('/admin/frontend-ui/popup-ads')
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Something went wrong',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error saving popup ad:', error)
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number | boolean | string[] | Record<string, unknown>) => {
    // Ensure we never set null values - convert to appropriate defaults
    let safeValue = value
    if (value === null || value === undefined) {
      if (typeof formData[field as keyof CreatePopupAdData] === 'string') {
        safeValue = ''
      } else if (typeof formData[field as keyof CreatePopupAdData] === 'number') {
        safeValue = 0
      } else if (typeof formData[field as keyof CreatePopupAdData] === 'boolean') {
        safeValue = false
      } else if (Array.isArray(formData[field as keyof CreatePopupAdData])) {
        safeValue = []
      } else {
        safeValue = {}
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: safeValue
    }))
  }

  const handleContentChange = (field: string, value: string) => {
    // Ensure we never set null values
    const safeValue = value || ''
    
    setFormData(prev => ({
      ...prev,
      content: {
        title: prev.content?.title || '',
        description: prev.content?.description || '',
        button_text: prev.content?.button_text || '',
        ...prev.content,
        [field]: safeValue
      }
    }))
  }

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    setFormData(prev => ({ ...prev, slug }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/frontend-ui/popup-ads')}
          disabled={loading || initialLoading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Popup Ads
        </Button>
        
        <Button type="submit" disabled={loading || initialLoading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : isEditing ? 'Update Popup Ad' : 'Create Popup Ad'}
        </Button>
      </div>

      {/* Loading State */}
      {initialLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading popup ad data...</p>
          </div>
        </div>
      )}

      {/* Form Content - Only show when not loading */}
      {!initialLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <BasicInfoSection 
              formData={formData}
              onInputChange={handleInputChange}
              onGenerateSlug={generateSlug}
            />

            <ContentMediaSection
              formData={formData}
              onInputChange={handleInputChange}
              onContentChange={handleContentChange}
            />

            <DisplaySettingsSection
              formData={formData}
              onInputChange={handleInputChange}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <PlatformSettingsSection
              formData={formData}
              onInputChange={handleInputChange}
            />

            <SchedulingSection
              formData={formData}
              onInputChange={handleInputChange}
            />

            <PreviewSection
              formData={formData}
            />
          </div>
        </div>
      )}
    </form>
  )
}