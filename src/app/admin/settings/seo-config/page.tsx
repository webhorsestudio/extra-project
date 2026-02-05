import { Metadata } from 'next'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import { getSettings, createDefaultSettings } from '@/lib/settings'
import { SEOConfigurationPage } from '@/components/admin/settings/SEOConfigurationPage'

export const metadata: Metadata = {
  title: 'SEO Configuration - Admin',
  description: 'Comprehensive SEO management, analytics, and optimization tools',
}

export default async function SEOConfigPage() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    console.error('SEO Configuration: Authentication error:', authError)
    redirect('/admin/login')
  }

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || profile.role !== 'admin') {
    console.error('SEO Configuration: User is not admin or profile error:', profileError)
    redirect('/admin/login')
  }

  // Fetch settings on the server
  let settings = await getSettings()
  
  if (!settings) {
    // Create default settings if none exist
    settings = await createDefaultSettings()
  }

  if (!settings) {
    // If we still can't get settings, redirect to error or show error
    redirect('/admin/dashboard?error=settings_init_failed')
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">SEO Configuration</h1>
            <p className="text-muted-foreground">
              Comprehensive SEO management, analytics, and optimization tools for your website.
            </p>
          </div>
          <SEOConfigurationPage settings={settings} />
        </div>
      </div>
    </div>
  )
}
