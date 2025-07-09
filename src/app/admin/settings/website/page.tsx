import { Metadata } from 'next'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import { getSettings, createDefaultSettings } from '@/lib/settings'
import { WebsiteSettingsForm } from '@/components/admin/settings/WebsiteSettingsForm'

export const metadata: Metadata = {
  title: 'Website Info Settings - Admin',
  description: 'Configure your website&apos;s basic information, metadata, and social media profiles',
}

export default async function WebsiteSettingsPage() {
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
    console.error('Website Settings: Authentication error:', authError)
    redirect('/admin/login')
  }

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || profile.role !== 'admin') {
    console.error('Website Settings: User is not admin or profile error:', profileError)
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

  // Ensure all required properties have default values
  const settingsWithDefaults = {
    site_title: settings.site_title || '',
    meta_description: settings.meta_description || '',
    default_og_image_url: settings.default_og_image_url || '',
    default_og_image_storage_path: settings.default_og_image_storage_path || '',
    website_url: settings.website_url || '',
    facebook_url: settings.facebook_url || '',
    twitter_url: settings.twitter_url || '',
    instagram_url: settings.instagram_url || '',
    linkedin_url: settings.linkedin_url || '',
    youtube_url: settings.youtube_url || '',
    tiktok_url: settings.tiktok_url || '',
    whatsapp_url: settings.whatsapp_url || '',
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Website Info Settings</h1>
            <p className="text-muted-foreground">
              Configure your website&apos;s basic information, metadata, and social media profiles.
            </p>
          </div>
          <WebsiteSettingsForm settings={settingsWithDefaults} />
        </div>
      </div>
    </div>
  )
} 
