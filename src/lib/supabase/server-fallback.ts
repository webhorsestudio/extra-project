import { createServerClient } from '@supabase/ssr'

// Fallback server client that doesn't use next/headers
// This can be used when the main server client fails due to build issues
export const createSupabaseServerClientFallback = () => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: () => undefined,
        set: () => {
          // No-op in fallback mode
        },
        remove: () => {
          // No-op in fallback mode
        },
      },
    }
  )
}

// Safe server client that tries the main one first, falls back to the fallback version
export const createSupabaseServerClientSafe = async () => {
  try {
    // Try to import and use the main server client
    const { createSupabaseServerClient } = await import('./server')
    return await createSupabaseServerClient()
  } catch (error) {
    console.warn('Failed to create main server client, using fallback:', error)
    // Use fallback version if main one fails
    return createSupabaseServerClientFallback()
  }
} 