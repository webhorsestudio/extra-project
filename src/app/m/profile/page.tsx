import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import MobileProfileClient from './MobileProfileClient'

export default async function MobileProfilePage() {
  // Get the user session server-side
  const supabase = await createSupabaseServerClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    // Redirect to login if not authenticated
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-3">Authentication Required</h1>
          <p className="text-gray-600 mb-6 text-sm">Please log in to view your profile.</p>
          <a 
            href="/users/login" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  // Fetch user profile data
  const adminClient = await createSupabaseAdminClient()
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('Error fetching profile:', profileError)
  }

  return (
    <MobileProfileClient 
      user={user}
      profile={profile}
      profileError={profileError?.message}
    />
  )
} 