import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import ServerLayout from '@/components/web/ServerLayout'
import ProfileContent from './ProfileContent'

export default async function ProfilePage() {
  // Get the user session server-side
  const supabase = await createSupabaseServerClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    // Redirect to login if not authenticated
    return (
      <ServerLayout showCategoryBar={false}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
            <p className="text-gray-600 mb-6">Please log in to view your profile.</p>
            <a 
              href="/users/login" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </a>
          </div>
        </div>
      </ServerLayout>
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
    <ServerLayout showCategoryBar={false}>
      <ProfileContent 
        user={user}
        profile={profile}
        profileError={profileError?.message}
      />
    </ServerLayout>
  )
} 