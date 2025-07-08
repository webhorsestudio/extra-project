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
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            console.error('Cookie set error in API Client:', error)
            // Throw error to prevent silent failures
            throw new Error(`Failed to set authentication cookie: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            console.error('Cookie remove error in API Client:', error)
            // Throw error to prevent silent failures
            throw new Error(`Failed to remove authentication cookie: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        },
      },
    }
  )
} 