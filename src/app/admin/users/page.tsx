import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import UsersClient from './UsersClient'

export default async function UsersPage() {
  // Create server client for authentication
  const supabase = await createSupabaseServerClient()
  
  // Get user session
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/admin/login')
  }

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || profile.role !== 'admin') {
    redirect('/admin/login')
  }

  // Fetch users data server-side
  const adminSupabase = await createSupabaseAdminClient()
  
  const { data: users, error: usersError } = await adminSupabase
    .from('profiles')
    .select('id, full_name, role, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (usersError) {
    console.error('Error fetching users:', usersError)
    throw new Error('Failed to fetch users')
  }

  // Transform users data to include emails
  const usersWithEmails = await Promise.all(
    (users || []).map(async (user) => {
      try {
        const { data: authUser } = await adminSupabase.auth.admin.getUserById(user.id)
        
        return {
          id: user.id,
          email: authUser?.user?.email || 'N/A',
          full_name: user.full_name || 'N/A',
          role: user.role || 'customer',
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      } catch (error) {
        console.error(`Error fetching email for user ${user.id}:`, error)
        return {
          id: user.id,
          email: 'N/A',
          full_name: user.full_name || 'N/A',
          role: user.role || 'customer',
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      }
    })
  )

  return <UsersClient initialUsers={usersWithEmails} />
} 
