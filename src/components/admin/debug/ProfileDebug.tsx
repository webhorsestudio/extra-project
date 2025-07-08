'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function ProfileDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runDebug = async () => {
    setLoading(true)
    setDebugInfo(null)

    try {
      console.log('🔍 Starting profile debug...')

      // Step 1: Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      console.log('Auth user:', user)
      console.log('Auth error:', authError)

      if (authError || !user) {
        setDebugInfo({
          step: 'Authentication failed',
          error: authError?.message || 'No user found',
          user: null
        })
        return
      }

      // Step 2: Try to fetch profile directly
      console.log('Fetching profile for user:', user.id)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      console.log('Profile data:', profile)
      console.log('Profile error:', profileError)

      // Step 3: Check if user is admin
      const isAdmin = profile?.role === 'admin'
      console.log('Is admin:', isAdmin)

      // Step 4: Test the is_admin() function
      const { data: adminCheck, error: adminCheckError } = await supabase
        .rpc('is_admin')

      console.log('Admin check result:', adminCheck)
      console.log('Admin check error:', adminCheckError)

      setDebugInfo({
        step: 'Profile fetch completed',
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        },
        profile: profile,
        profileError: profileError?.message,
        isAdmin: isAdmin,
        adminCheck: adminCheck,
        adminCheckError: adminCheckError?.message
      })

    } catch (error) {
      console.error('Debug error:', error)
      setDebugInfo({
        step: 'Debug failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Profile Debug Tool</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runDebug} disabled={loading}>
          {loading ? 'Running Debug...' : 'Run Profile Debug'}
        </Button>

        {debugInfo && (
          <div className="space-y-4">
            <h3 className="font-semibold">Debug Results:</h3>
            
            <div className="bg-gray-100 p-4 rounded">
              <h4 className="font-medium">Step: {debugInfo.step}</h4>
              
              {debugInfo.error && (
                <div className="text-red-600 mt-2">
                  <strong>Error:</strong> {debugInfo.error}
                </div>
              )}

              {debugInfo.user && (
                <div className="mt-2">
                  <strong>User:</strong>
                  <pre className="text-sm bg-white p-2 rounded mt-1">
                    {JSON.stringify(debugInfo.user, null, 2)}
                  </pre>
                </div>
              )}

              {debugInfo.profile && (
                <div className="mt-2">
                  <strong>Profile:</strong>
                  <pre className="text-sm bg-white p-2 rounded mt-1">
                    {JSON.stringify(debugInfo.profile, null, 2)}
                  </pre>
                </div>
              )}

              {debugInfo.profileError && (
                <div className="text-red-600 mt-2">
                  <strong>Profile Error:</strong> {debugInfo.profileError}
                </div>
              )}

              {debugInfo.isAdmin !== undefined && (
                <div className="mt-2">
                  <strong>Is Admin:</strong> {debugInfo.isAdmin ? 'Yes' : 'No'}
                </div>
              )}

              {debugInfo.adminCheck !== undefined && (
                <div className="mt-2">
                  <strong>Admin Check Function:</strong> {debugInfo.adminCheck ? 'True' : 'False'}
                </div>
              )}

              {debugInfo.adminCheckError && (
                <div className="text-red-600 mt-2">
                  <strong>Admin Check Error:</strong> {debugInfo.adminCheckError}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 