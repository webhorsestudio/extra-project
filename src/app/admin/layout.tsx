import { AdminLayout } from '@/components/layouts/AdminLayout'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAdminNavigationItems } from '@/components/admin/navigation/getAdminNavigationItems'
import { checkAdminAuth } from '@/lib/admin-data'

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createSupabaseServerClient()
  let profile = null
  let loading = false
  let logoData = { logoUrl: null, logoAltText: null };
  let logoLoading = true;

  // Use the improved checkAdminAuth function
  const { user, profile: adminProfile, error } = await checkAdminAuth()
  
  // If there's an error or no user, redirect to login
  if (error || !user || !adminProfile) {
    console.log('Admin layout: Authentication failed, redirecting to login')
    redirect('/users/login')
  }

  profile = adminProfile

  try {
    const { data: logo, error: logoError } = await supabase
      .from('settings')
      .select('logo_url, logo_alt_text')
      .single();
    if (!logoError && logo) {
      logoData = {
        logoUrl: logo.logo_url,
        logoAltText: logo.logo_alt_text
      };
    }
    logoLoading = false;
  } catch (e) {
    logoLoading = false;
  }

  const navigationItems = getAdminNavigationItems(profile);

  return (
    <AdminLayout user={user} profile={profile} loading={loading} logoData={logoData} logoLoading={logoLoading} navigationItems={navigationItems}>
      {children}
    </AdminLayout>
  )
} 

