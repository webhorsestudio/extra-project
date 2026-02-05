export interface Testimonial {
  id: string
  quote: string
  name: string
  title: string
  avatar_url: string | null
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type CreateTestimonialInput = {
  quote: string
  name: string
  title: string
  avatar_url?: string | null
  order_index?: number
  is_active?: boolean
}

export type UpdateTestimonialInput = Partial<CreateTestimonialInput>


