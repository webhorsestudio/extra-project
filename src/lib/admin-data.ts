import { createSupabaseAdminClient, createSupabaseAdminUserClient } from './supabase/admin'

export interface DashboardStats {
  totalUsers: number
  totalProperties: number
  totalInquiries: number
  monthlyUsers: number
  monthlyProperties: number
  monthlyInquiries: number
  recentUsers: Record<string, unknown>[]
  recentProperties: Record<string, unknown>[]
  recentInquiries: Record<string, unknown>[]
}

export interface Inquiry {
  id: string
  name: string
  email: string
  phone?: string
  message: string
  inquiry_type: 'property' | 'contact' | 'support' | 'other'
  property_id?: string
  status: 'unread' | 'read' | 'in_progress' | 'resolved' | 'closed' | 'spam'
  subject?: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  source: 'website' | 'phone' | 'email' | 'social' | 'referral'
  assigned_to?: string
  response_notes?: string
  responded_at?: string
  response_method?: 'email' | 'phone' | 'sms' | 'whatsapp' | 'in_person'
  created_at: string
  updated_at: string
  property?: {
    id: string
    title: string
  }
  assigned_user?: {
    id: string
    full_name: string
  }
}

// Check if user is admin
export async function checkAdminAuth() {
  try {
    const supabase = await createSupabaseAdminUserClient()
    
    console.log('Checking admin authentication...')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('Auth result:', { user: user?.id, error: authError?.message })
    
    if (authError) {
      console.error('Authentication error:', authError)
      
      // Provide more specific error messages
      if (authError.message?.includes('session missing')) {
        return { user: null, profile: null, error: 'No active session. Please log in.' }
      }
      if (authError.message?.includes('expired')) {
        return { user: null, profile: null, error: 'Session expired. Please log in again.' }
      }
      
      return { user: null, profile: null, error: 'Authentication failed. Please log in.' }
    }
    
    if (!user) {
      console.log('No user found')
      return { user: null, profile: null, error: 'No user found. Please log in.' }
    }

    // Get user profile using service role client to bypass RLS
    const adminClient = await createSupabaseAdminClient()
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    console.log('Profile result:', { profile: profile?.role, error: profileError?.message })

    if (profileError || !profile) {
      console.error('Profile error:', profileError)
      return { user: null, profile: null, error: 'User profile not found. Please contact support.' }
    }

    if (profile.role !== 'admin') {
      console.log('User is not admin')
      return { user: null, profile: null, error: 'Admin access required. Please log in with admin credentials.' }
    }

    console.log('Admin authentication successful')
    return { user, profile, error: null }
  } catch (error) {
    console.error('Error in checkAdminAuth:', error)
    return { user: null, profile: null, error: 'Server error. Please try again.' }
  }
}

// Fetch dashboard statistics
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    console.log('Fetching dashboard stats...')
    const supabase = await createSupabaseAdminClient()
    
    // Use direct queries with service role client (bypasses RLS)
    console.log('Fetching users...')
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (usersError) {
      console.error('Error fetching users:', usersError)
    }

    console.log('Fetching properties...')
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError)
    }

    console.log('Fetching inquiries...')
    const { data: inquiries, error: inquiriesError } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (inquiriesError) {
      console.error('Error fetching inquiries:', inquiriesError)
    }

    // Calculate stats
    const totalUsers = users?.length || 0
    const totalProperties = properties?.length || 0
    const totalInquiries = inquiries?.length || 0
    
    const recentUsers = users?.slice(0, 5) || []
    const recentProperties = properties?.slice(0, 5) || []
    const recentInquiries = inquiries?.slice(0, 5) || []

    // Calculate monthly stats
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const monthlyUsers = users?.filter(user => 
      new Date(user.created_at) >= startOfMonth
    ).length || 0
    
    const monthlyProperties = properties?.filter(property => 
      new Date(property.created_at) >= startOfMonth
    ).length || 0
    
    const monthlyInquiries = inquiries?.filter(inquiry => 
      new Date(inquiry.created_at) >= startOfMonth
    ).length || 0

    console.log('Dashboard stats calculated:', {
      totalUsers,
      totalProperties,
      totalInquiries,
      monthlyUsers,
      monthlyProperties,
      monthlyInquiries
    })

    return {
      totalUsers,
      totalProperties,
      totalInquiries,
      monthlyUsers,
      monthlyProperties,
      monthlyInquiries,
      recentUsers,
      recentProperties,
      recentInquiries
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      totalUsers: 0,
      totalProperties: 0,
      totalInquiries: 0,
      monthlyUsers: 0,
      monthlyProperties: 0,
      monthlyInquiries: 0,
      recentUsers: [],
      recentProperties: [],
      recentInquiries: []
    }
  }
}

// Fetch all inquiries with property details
export async function getInquiries(): Promise<Inquiry[]> {
  try {
    const supabase = await createSupabaseAdminClient()
    
    const { data: inquiries, error } = await supabase
      .from('inquiries')
      .select(`
        *,
        property:properties(id, title)
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching inquiries:', error)
      return []
    }
    
    return inquiries || []
  } catch (error) {
    console.error('Error in getInquiries:', error)
    return []
  }
}

// Update inquiry status
export async function updateInquiryStatus(inquiryId: string, newStatus: string): Promise<void> {
  try {
    const supabase = await createSupabaseAdminClient()
    
    const { error } = await supabase
      .from('inquiries')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', inquiryId)
    
    if (error) {
      console.error('Error updating inquiry status:', error)
      throw error
    }
  } catch (error) {
    console.error('Error in updateInquiryStatus:', error)
    throw error
  }
} 