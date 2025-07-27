import { Metadata } from 'next'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import { getSettings, createDefaultSettings } from '@/lib/settings'
import { SMTPSettingsForm } from '@/components/admin/settings/SMTPSettingsForm'

export const metadata: Metadata = {
  title: 'SMTP Settings - Admin',
  description: 'Configure SMTP settings and email templates for user signup confirmation and password reset',
}

export default async function SMTPSettingsPage() {
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
    console.error('SMTP Settings: Authentication error:', authError)
    redirect('/admin/login')
  }

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || profile.role !== 'admin') {
    console.error('SMTP Settings: User is not admin or profile error:', profileError)
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
    smtp_host: settings.smtp_host || '',
    smtp_port: settings.smtp_port || 587,
    smtp_username: settings.smtp_username || '',
    smtp_password: settings.smtp_password || '',
    smtp_secure: settings.smtp_secure || false,
    email_from: settings.email_from || '',
    email_from_name: settings.email_from_name || '',
    signup_confirmation_subject: settings.signup_confirmation_subject || 'Confirm your email address',
    signup_confirmation_body: settings.signup_confirmation_body || '',
    password_reset_subject: settings.password_reset_subject || 'Reset your password',
    password_reset_body: settings.password_reset_body || '',
    email_confirmation_enabled: settings.email_confirmation_enabled || false,
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">SMTP Settings</h1>
            <p className="text-muted-foreground">
              Configure SMTP settings and email templates for user signup confirmation and password reset.
            </p>
          </div>
          <SMTPSettingsForm settings={settingsWithDefaults} />
        </div>
      </div>
    </div>
  )
} 