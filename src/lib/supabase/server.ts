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
        set(name: string, value: string, options: Record<string, unknown>) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            console.error('Cookie set error in Server Client:', error)
            // Throw error to prevent silent failures
            throw new Error(`Failed to set authentication cookie: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        },
        remove(name: string, options: Record<string, unknown>) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            console.error('Cookie remove error in Server Client:', error)
            // Throw error to prevent silent failures
            throw new Error(`Failed to remove authentication cookie: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        },
      },
    }
  )
} 