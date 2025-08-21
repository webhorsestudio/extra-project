export type PopupAdType = 'banner' | 'modal' | 'toast' | 'slide_in' | 'fullscreen'
export type PopupAdPosition = 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right' | 'center' | 'top_center' | 'bottom_center'
export type PopupAdStatus = 'draft' | 'published' | 'archived'

export interface PopupAdContent {
  title?: string
  description?: string
  button_text?: string
  custom_html?: string
  [key: string]: string | undefined
}

export interface PopupAdConditions {
  user_type?: 'all' | 'guest' | 'authenticated' | 'premium'
  device_type?: 'all' | 'mobile' | 'desktop' | 'tablet'
  time_of_day?: {
    start?: string // HH:MM format
    end?: string // HH:MM format
  }
  day_of_week?: number[] // 0-6 (Sunday-Saturday)
  user_behavior?: {
    page_views?: number
    time_on_site?: number
    scroll_depth?: number
  }
  [key: string]: string | number | boolean | string[] | number[] | { start?: string; end?: string } | { page_views?: number; time_on_site?: number; scroll_depth?: number } | undefined
}

export interface PopupAd {
  id: string
  title: string
  slug: string
  type: PopupAdType
  position: PopupAdPosition
  content: PopupAdContent
  image_url?: string
  link_url?: string
  link_text?: string
  status: PopupAdStatus
  priority: number
  display_delay: number
  display_duration: number
  max_display_count: number
  user_display_count: number
  start_date?: string
  end_date?: string
  is_active: boolean
  show_on_mobile: boolean
  show_on_desktop: boolean
  show_on_tablet: boolean
  target_pages: string[]
  exclude_pages: string[]
  user_segments: Record<string, string | number | boolean | string[] | undefined>
  conditions: PopupAdConditions
  metadata: Record<string, string | number | boolean | string[] | undefined>
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

export interface CreatePopupAdData {
  title: string
  slug: string
  type: PopupAdType
  position: PopupAdPosition
  content: PopupAdContent
  image_url?: string
  link_url?: string
  link_text?: string
  status: PopupAdStatus
  priority: number
  display_delay: number
  display_duration: number
  max_display_count: number
  start_date?: string
  end_date?: string
  is_active: boolean
  show_on_mobile: boolean
  show_on_desktop: boolean
  show_on_tablet: boolean
  target_pages: string[]
  exclude_pages: string[]
  user_segments: Record<string, string | number | boolean | string[] | undefined>
  conditions: PopupAdConditions
  metadata: Record<string, string | number | boolean | string[] | undefined>
}

export interface UpdatePopupAdData extends Partial<CreatePopupAdData> {
  id: string
}

export interface PopupAdFilters {
  search?: string
  type?: PopupAdType
  status?: PopupAdStatus
  is_active?: boolean
  show_on_mobile?: boolean
  show_on_desktop?: boolean
  show_on_tablet?: boolean
  start_date?: string
  end_date?: string
}

export interface PopupAdStats {
  total_views: number
  total_clicks: number
  click_through_rate: number
  average_display_time: number
  conversion_rate: number
}
