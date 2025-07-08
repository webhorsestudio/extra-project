export interface Inquiry {
  id: string
  name: string
  email: string
  phone?: string
  message: string
  subject?: string
  inquiry_type: 'property' | 'contact' | 'support' | 'tour_booking' | 'other'
  property_id?: string
  status: 'unread' | 'read' | 'in_progress' | 'resolved' | 'closed' | 'spam'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  source: 'website' | 'phone' | 'email' | 'social' | 'referral'
  assigned_to?: string
  response_notes?: string
  responded_at?: string
  response_method?: 'email' | 'phone' | 'sms' | 'whatsapp' | 'in_person'
  attachment_url?: string
  created_at: string
  updated_at: string
  
  // Property inquiry specific fields
  property_configurations?: string[]
  property_name?: string
  property_location?: string
  property_price_range?: string
  
  // Tour booking specific fields
  tour_date?: string
  tour_time?: string
  tour_type?: string[]
  tour_status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
}

export interface Property {
  id: string
  title: string
  slug: string
}

export interface InquiryWithProperty extends Inquiry {
  property?: Property
}

export type InquiryStatus = 'unread' | 'read' | 'in_progress' | 'resolved' | 'closed' | 'spam'
export type InquiryType = 'property' | 'contact' | 'support' | 'tour_booking' | 'other'
export type InquiryPriority = 'low' | 'normal' | 'high' | 'urgent'
export type InquirySource = 'website' | 'phone' | 'email' | 'social' | 'referral'
export type TourStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
export type ResponseMethod = 'email' | 'phone' | 'sms' | 'whatsapp' | 'in_person'

export interface InquiryFilters {
  status?: InquiryStatus
  type?: InquiryType
  priority?: InquiryPriority
  source?: InquirySource
  search?: string
  date_from?: string
  date_to?: string
}

// Specific interfaces for different inquiry types
export interface PropertyInquiry extends Inquiry {
  inquiry_type: 'property'
  property_configurations: string[]
  property_name: string
  property_location: string
  property_price_range?: string
}

export interface TourBooking extends Inquiry {
  inquiry_type: 'tour_booking'
  tour_date: string
  tour_time: string
  tour_type: string[]
  tour_status: TourStatus
} 