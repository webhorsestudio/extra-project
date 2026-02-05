'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { User } from '@supabase/supabase-js'
import type { Session } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  full_name: string
  role: string
  avatar_url?: string
  avatar_data?: string
  created_at: string
  updated_at: string
}

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null
  })

  const fetchUserAndProfile = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      console.log('useAuth: Fetching user and profile...')
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('useAuth: Error getting user:', userError)
        setState({
          user: null,
          profile: null,
          loading: false,
          error: userError.message
        })
        return
      }
      
      if (!user) {
        console.log('useAuth: No user found')
        setState({
          user: null,
          profile: null,
          loading: false,
          error: null
        })
        return
      }

      // Check if email is confirmed
      if (!user.email_confirmed_at) {
        console.log('useAuth: Email not confirmed')
        setState({
          user: null,
          profile: null,
          loading: false,
          error: 'Email not confirmed'
        })
        return
      }

      console.log('useAuth: User found, fetching profile...')
      // Fetch user profile to get role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('useAuth: Error fetching user profile:', profileError)
        setState({
          user,
          profile: null,
          loading: false,
          error: profileError.message
        })
        return
      }

      if (!profile) {
        console.error('useAuth: No profile found for user, attempting to create...')
        // Try to create the profile automatically
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || '',
            role: 'customer',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        if (!insertError) {
          // Try fetching the profile again
          const { data: newProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          if (newProfile) {
            setState({
              user,
              profile: newProfile,
              loading: false,
              error: null
            });
            return;
          }
        }
        setState({
          user,
          profile: null,
          loading: false,
          error: 'Profile not found'
        });
        return;
      }

      console.log('useAuth: Profile fetched successfully:', profile.role)
      setState({
        user,
        profile,
        loading: false,
        error: null
      })
    } catch (error) {
      console.error('useAuth: Error fetching user data:', error)
      setState({
        user: null,
        profile: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }, [])

  const handleAuthChange = useCallback(async (event: string, session: Session | null) => {
    console.log('useAuth: Auth state changed:', event, session?.user?.email)
    
    try {
      const currentUser = session?.user || null
      
      if (!currentUser) {
        setState({
          user: null,
          profile: null,
          loading: false,
          error: null
        })
        return
      }

      // Check if email is confirmed
      if (!currentUser.email_confirmed_at) {
        console.log('useAuth: Email not confirmed in auth change')
        setState({
          user: null,
          profile: null,
          loading: false,
          error: 'Email not confirmed'
        })
        return
      }

      // Fetch user profile to get role
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single()

      if (error) {
        console.error('useAuth: Error fetching user profile:', error)
        setState({
          user: currentUser,
          profile: null,
          loading: false,
          error: error.message
        })
        return
      }

      if (!profile) {
        // Profile doesn't exist, create one (first-time login)
        console.log('useAuth: Profile not found, creating one for first-time login...')
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: currentUser.id,
            full_name: currentUser.user_metadata?.full_name || '',
            role: 'customer',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error('useAuth: Profile creation error:', insertError);
          setState({
            user: currentUser,
            profile: null,
            loading: false,
            error: 'Profile creation failed'
          })
          return
        }

        // Fetch the newly created profile
        const { data: newProfile, error: newProfileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        if (newProfileError || !newProfile) {
          setState({
            user: currentUser,
            profile: null,
            loading: false,
            error: 'Profile not found after creation'
          })
          return
        }

        setState({
          user: currentUser,
          profile: newProfile,
          loading: false,
          error: null
        })
        return
      }

      setState({
        user: currentUser,
        profile,
        loading: false,
        error: null
      })
    } catch (error) {
      console.error('useAuth: Error in auth state change:', error)
      setState({
        user: null,
        profile: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }, [])

  useEffect(() => {
    fetchUserAndProfile()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange)

    return () => subscription.unsubscribe()
  }, [fetchUserAndProfile, handleAuthChange])

  return {
    ...state,
    isAuthenticated: !!state.user
  }
} 