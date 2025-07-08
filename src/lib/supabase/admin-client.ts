import { createClient } from '@supabase/supabase-js'

// Client-side admin client - using anon key with RLS policies
// The service role key should not be exposed to the client for security
export const createSupabaseAdminClientClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true
      }
    }
  )
}

// Client-side admin client with user context (for RLS-aware operations)
export const createSupabaseAdminUserClientClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true
      }
    }
  )
} 