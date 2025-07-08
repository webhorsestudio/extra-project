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

export interface CreateDeveloperData {
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
  is_active?: boolean
}

export interface UpdateDeveloperData {
  name?: string
  website?: string
  address?: string
  logo_url?: string
  logo_storage_path?: string
  contact_info?: {
    phone?: string
    email?: string
    office_hours?: string
  }
  is_active?: boolean
}

export interface DeveloperFormData {
  name: string
  website: string
  address: string
  logo_url: string
  logo_storage_path: string
  contact_info: {
    phone: string
    email: string
    office_hours: string
  }
} 