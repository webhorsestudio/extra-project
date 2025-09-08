import { createServerClient } from '@supabase/ssr'

// Dynamic import to avoid build issues with next/headers
export const createSupabaseServerClient = async () => {
  // Dynamically import cookies to avoid build issues
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        set(_name: string, _value: string, _options: Record<string, unknown>) {
          // Silently ignore cookie setting in Server Components
          // This is expected behavior and won't break the application
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        remove(_name: string, _options: Record<string, unknown>) {
          // Silently ignore cookie removal in Server Components
          // This is expected behavior and won't break the application
        },
      },
    }
  )
} 