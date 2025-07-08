export interface User {
  id: string
  email: string
  full_name?: string
  role: 'admin' | 'agent' | 'customer'
  avatar_data?: string
  created_at: string
  updated_at: string
}

export interface CreateUserData {
  email: string
  password: string
  full_name: string
  role: 'admin' | 'agent' | 'customer'
}

export interface UpdateUserData {
  full_name?: string
  role?: 'admin' | 'agent' | 'customer'
  password?: string
}

export interface UserFilters {
  search: string
  role: 'all' | 'admin' | 'agent' | 'customer'
  sortBy: 'created_at' | 'full_name' | 'role'
  sortOrder: 'asc' | 'desc'
} 