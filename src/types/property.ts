export interface Property {
  id: string
  slug?: string
  title: string
  description: string
  property_type: 'House' | 'Apartment' | 'Commercial' | 'Land' | 'Villa' | 'Penthouse'
  property_collection: 'Newly Launched' | 'Featured' | 'Ready to Move' | 'Under Construction'
  location_id?: string
  location: string
  latitude: number
  longitude: number
  created_at: string
  updated_at: string
  created_by: string
  posted_by: string
  developer_id?: string
  parking: boolean
  parking_spots?: number
  rera_number?: string | null
  bhk_configurations?: BHKConfiguration[]
  property_configurations?: BHKConfiguration[]
  images?: PropertyImage[]
  property_images?: PropertyImage[]
  location_data?: { id: string; name: string } | null
  developer?: PropertyDeveloper
  // Arrays for easy access to related data
  amenities?: string[]
  categories?: string[]
  
  // Additional properties used in components
  status?: string
  price?: number
  is_verified?: boolean
  bedrooms?: number
  bathrooms?: number
  area?: number
  year_built?: string
  lot_size?: string
  floor_level?: string
  total_floors?: string
  features?: string[]
  
  // Analytics properties
  view_count?: number
  favorite_count?: number
  property_views?: PropertyView[]
  property_favorites?: PropertyFavorite[]
  
  // Relationship properties
  property_amenities?: PropertyAmenityRelation[]
  property_categories?: PropertyCategoryRelation[]
}

export interface BHKConfiguration {
  id?: string
  property_id: string
  bhk: number
  price: number
  area: number
  bedrooms: number
  bathrooms: number
  floor_plan_url?: string
  brochure_url?: string
  ready_by?: string
}

export interface PropertyImage {
  id: string
  property_id: string
  image_url: string
  created_at: string
}

// New interfaces for relationships
export interface PropertyAmenityRelation {
  id: string
  property_id: string
  amenity_id: string
  created_at: string
  amenity?: Amenity
}

export interface PropertyCategoryRelation {
  id: string
  property_id: string
  category_id: string
  created_at: string
  category?: PropertyCategory
}

export interface PropertyView {
  id: string
  property_id: string
  viewer_ip?: string
  viewed_at: string
}

export interface PropertyFavorite {
  id: string
  property_id: string
  user_id: string
  created_at: string
  user?: User
}

export interface PropertyReview {
  id: string
  property_id: string
  user_id: string
  rating: number
  review_text?: string
  created_at: string
  updated_at: string
  user?: User
}

export interface PropertyCategory {
  id: string
  name: string
  icon: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  full_name?: string
  role: 'admin' | 'agent' | 'customer'
  created_at: string
  updated_at: string
}

export interface Amenity {
  id: string
  name: string
  image_url?: string
  image_storage_path?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PropertyDeveloper {
  id: string
  name: string
  website?: string
  address?: string
  logo_url?: string
  logo_storage_path?: string
  contact_info?: {
    phone?: string
    email?: string
    office_hours?: string
  }
  is_active: boolean
  created_at: string
  updated_at: string
} 