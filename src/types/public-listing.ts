export type PublicListingType = 'public_property'

export type PublicListingStatus = 'draft' | 'published' | 'archived'

export interface PublicListing {
  id: string
  title: string
  slug: string
  type: PublicListingType
  content: Record<string, unknown>
  excerpt?: string
  featured_image_url?: string
  status: PublicListingStatus
  order_index: number
  metadata: Record<string, unknown>
  publish_date?: string
  expire_date?: string
  created_at: string
  updated_at: string
}

export interface CreatePublicListingData {
  title: string
  slug: string
  type: PublicListingType
  content: Record<string, unknown>
  excerpt?: string
  featured_image_url?: string
  status: PublicListingStatus
  order_index?: number
  metadata?: Record<string, unknown>
  publish_date?: string
  expire_date?: string
}

export interface UpdatePublicListingData {
  title?: string
  slug?: string
  type?: PublicListingType
  content?: Record<string, unknown>
  excerpt?: string
  featured_image_url?: string
  status?: PublicListingStatus
  order_index?: number
  metadata?: Record<string, unknown>
  publish_date?: string
  expire_date?: string
}

export const PUBLIC_LISTING_TYPES: { value: PublicListingType; label: string; description: string }[] = [
  {
    value: 'public_property',
    label: 'Public Property',
    description: ''
  }
]

export const PUBLIC_LISTING_STATUSES: { value: PublicListingStatus; label: string; color: string }[] = [
  {
    value: 'draft',
    label: 'Draft',
    color: 'bg-yellow-100 text-yellow-800'
  },
  {
    value: 'published',
    label: 'Published',
    color: 'bg-green-100 text-green-800'
  },
  {
    value: 'archived',
    label: 'Archived',
    color: 'bg-gray-100 text-gray-800'
  }
]
