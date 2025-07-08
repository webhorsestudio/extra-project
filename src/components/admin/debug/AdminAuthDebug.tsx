'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface DebugInfo {
  user: {
    id: string
    email: string
    created_at: string
    email_confirmed_at: string | null
  } | null
  profile: Record<string, unknown> | null
  authError: string | null
  profileError: string | null
  loading: boolean
  session: unknown
}

export function AdminAuthDebug() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    user: null,
    profile: null,
    authError: null,
    profileError: null,
    loading: true,
    session: null
  })

  const runDebug = async () => {
    setDebugInfo({ loading: true, user: null, profile: null, authError: null, profileError: null, session: null })

    try {
      // Test 1: Check environment variables
      console.log('Environment check:')
      console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing')
      console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing')

      // Test 2: Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        setDebugInfo({
          loading: false,
          user: null,
          profile: null,
          session: null,
          authError: sessionError.message,
          profileError: null
        })
        return
      }

      // Test 3: Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        setDebugInfo({
          loading: false,
          user: null,
          profile: null,
          session: session,
          authError: authError.message,
          profileError: null
        })
        return
      }

      if (!user) {
        setDebugInfo({
          loading: false,
          user: null,
          profile: null,
          session: session,
          authError: 'No authenticated user',
          profileError: null
        })
        return
      }

      // Test 4: Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setDebugInfo({
        loading: false,
        user: {
          id: user.id || '',
          email: user.email || '',
          created_at: user.created_at || '',
          email_confirmed_at: user.email_confirmed_at || null
        },
        profile: profile,
        session: {
          access_token: session?.access_token || null,
          refresh_token: session?.refresh_token || null,
          expires_at: session?.expires_at || null
        },
        authError: null,
        profileError: profileError?.message || null
      })

    } catch (error) {
      setDebugInfo({
        loading: false,
        user: null,
        profile: null,
        session: null,
        authError: 'Unexpected error',
        profileError: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  useEffect(() => {
    runDebug()
  }, [])

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Admin Authentication Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runDebug} disabled={debugInfo.loading}>
            {debugInfo.loading ? 'Running...' : 'Run Debug'}
          </Button>
          {!debugInfo.user && (
            <Button asChild variant="outline">
              <Link href="/users/login">Go to Login</Link>
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Session Info:</h3>
          {debugInfo.session ? (
            <pre className="bg-gray-100 p-2 rounded text-sm">
              {JSON.stringify(debugInfo.session, null, 2)}
            </pre>
          ) : (
            <p className="text-red-500">No session found</p>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">User Info:</h3>
          {debugInfo.user ? (
            <pre className="bg-gray-100 p-2 rounded text-sm">
              {JSON.stringify(debugInfo.user, null, 2)}
            </pre>
          ) : (
            <p className="text-red-500">No user found</p>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Profile Info:</h3>
          {debugInfo.profile ? (
            <pre className="bg-gray-100 p-2 rounded text-sm">
              {JSON.stringify(debugInfo.profile, null, 2)}
            </pre>
          ) : (
            <p className="text-red-500">No profile found</p>
          )}
        </div>

        {debugInfo.authError && (
          <div className="space-y-2">
            <h3 className="font-semibold text-red-600">Auth Error:</h3>
            <p className="text-red-500">{debugInfo.authError}</p>
          </div>
        )}

        {debugInfo.profileError && (
          <div className="space-y-2">
            <h3 className="font-semibold text-red-600">Profile Error:</h3>
            <p className="text-red-500">{debugInfo.profileError}</p>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="font-semibold">Environment Variables:</h3>
          <p>SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
          <p>ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
        </div>

        {!debugInfo.user && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Authentication Required</h4>
            <p className="text-yellow-700 mb-3">
              You need to sign in to access the admin panel. Please use the login button above or navigate to the login page.
            </p>
            <div className="flex gap-2">
              <Button asChild size="sm">
                <Link href="/users/login">Sign In</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/users/register">Register</Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 