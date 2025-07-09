import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Admin client with service role key for admin operations
export const createSupabaseAdminClient = async () => {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key for admin operations
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            console.error('Cookie set error in Admin Client:', error)
            // Throw error to prevent silent failures
            throw new Error(`Failed to set authentication cookie: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        },
        remove(name: string, options: Record<string, unknown>) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            console.error('Cookie remove error in Admin Client:', error)
            // Throw error to prevent silent failures
            throw new Error(`Failed to remove authentication cookie: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        },
      },
    }
  )
}

// Regular admin client with user context (for RLS-aware operations)
export const createSupabaseAdminUserClient = async () => {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            console.error('Cookie set error in Admin User Client:', error)
            // Throw error to prevent silent failures
            throw new Error(`Failed to set authentication cookie: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        },
        remove(name: string, options: Record<string, unknown>) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            console.error('Cookie remove error in Admin User Client:', error)
            // Throw error to prevent silent failures
            throw new Error(`Failed to remove authentication cookie: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        },
      },
    }
  )
} 