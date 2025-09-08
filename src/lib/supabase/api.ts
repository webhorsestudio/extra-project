import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createSupabaseApiClient = async () => {
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
          // Silently ignore cookie setting in API routes
          // This is expected behavior and won't break the application
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        remove(_name: string, _options: Record<string, unknown>) {
          // Silently ignore cookie removal in API routes
          // This is expected behavior and won't break the application
        },
      },
    }
  )
} 