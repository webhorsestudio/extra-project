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
            console.warn('Cookie set error in Admin Client (non-critical):', error)
            // Don't throw error - cookies can't always be set in Server Components
            // This is expected behavior and shouldn't break the application
          }
        },
        remove(name: string, options: Record<string, unknown>) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            console.warn('Cookie remove error in Admin Client (non-critical):', error)
            // Don't throw error - cookies can't always be set in Server Components
            // This is expected behavior and shouldn't break the application
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
            console.warn('Cookie set error in Admin User Client (non-critical):', error)
            // Don't throw error - cookies can't always be set in Server Components
            // This is expected behavior and shouldn't break the application
          }
        },
        remove(name: string, options: Record<string, unknown>) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            console.warn('Cookie remove error in Admin User Client (non-critical):', error)
            // Don't throw error - cookies can't always be set in Server Components
            // This is expected behavior and shouldn't break the application
          }
        },
      },
    }
  )
} 