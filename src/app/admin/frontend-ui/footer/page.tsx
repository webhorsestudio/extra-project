import { Metadata } from 'next'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import FooterDesignTabs from '@/components/admin/frontend-ui/FooterDesignTabs'

export const metadata: Metadata = {
  title: 'Footer Design - Admin',
  description: 'Manage footer design and layout',
}

export default async function FooterDesignPage() {
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
    console.error('Footer Design: Authentication error:', authError)
    redirect('/admin/login')
  }

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || profile.role !== 'admin') {
    console.error('Footer Design: User is not admin or profile error:', profileError)
    redirect('/admin/login')
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Footer Design</h1>
        <p className="text-muted-foreground">
          Customize the footer layout, content, and design for your website
        </p>
      </div>

      <FooterDesignTabs />
    </div>
  )
} 