import { createBrowserClient } from '@supabase/ssr'

/**
 * Create a client-side Supabase client for use in client components
 * This should NOT use next/headers or any server-only APIs
 */
export const createSupabaseClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * Create a client-side Supabase client with error handling
 */
export const createSupabaseClientSafe = () => {
  try {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  } catch (error) {
    console.error('Error creating Supabase client:', error)
    throw new Error('Failed to create Supabase client')
  }
}
