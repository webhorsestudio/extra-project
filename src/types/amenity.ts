export interface Amenity {
  id: string
  name: string
  image_url?: string
  image_storage_path?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateAmenityData {
  name: string
  image_url?: string
  image_storage_path?: string
  is_active?: boolean
}

export interface UpdateAmenityData {
  name?: string
  image_url?: string
  image_storage_path?: string
  is_active?: boolean
}

export interface AmenityFormData {
  name: string
  image_url: string
  image_storage_path: string
} 