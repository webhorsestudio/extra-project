'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface UserProfile {
  id: string
  full_name: string
  role: string
  avatar_url?: string
  avatar_data?: string
  created_at: string
  updated_at: string
}

interface AdminAuthState {
  user: any
  profile: UserProfile | null
  loading: boolean
  error: string | null
}

export function useAdminAuth() {
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null
  })

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      // Use regular client with RLS policies
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) {
        console.error('Profile fetch error:', profileError)
        return null
      }

      return profile
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  const checkAdminRole = (profile: UserProfile | null): boolean => {
    if (!profile) return false
    return profile.role === 'admin'
  }

  useEffect(() => {
    let mounted = true

    // Add a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (mounted && state.loading) {
        console.log('useAdminAuth: Loading timeout reached, forcing loading to false')
        setState(prev => ({ ...prev, loading: false }))
      }
    }, 10000) // 10 seconds timeout

    const initializeAuth = async () => {
      try {
        console.log('useAdminAuth: Starting authentication check...')
        setState(prev => ({ ...prev, loading: true, error: null }))

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        console.log('useAdminAuth: User check result:', { user: user?.id, error: authError })
        
        if (authError) {
          console.error('Auth error:', authError)
          if (mounted) {
            setState({
              user: null,
              profile: null,
              loading: false,
              error: authError.message
            })
          }
          return
        }

        if (!user) {
          console.log('useAdminAuth: No user found')
          if (mounted) {
            setState({
              user: null,
              profile: null,
              loading: false,
              error: null
            })
          }
          return
        }

        console.log('useAdminAuth: User found, fetching profile...')

        // Fetch user profile
        const profile = await fetchUserProfile(user.id)
        
        console.log('useAdminAuth: Profile fetch result:', { profile: profile?.id, role: profile?.role })
        
        if (!mounted) return

        if (!profile) {
          console.log('useAdminAuth: No profile found')
          setState({
            user: null,
            profile: null,
            loading: false,
            error: 'Profile not found'
          })
          return
        }

        // Check if user is admin
        if (!checkAdminRole(profile)) {
          console.log('useAdminAuth: User is not admin')
          setState({
            user: null,
            profile: null,
            loading: false,
            error: 'Admin access required'
          })
          return
        }

        console.log('useAdminAuth: Authentication successful, user is admin')
        setState({
          user,
          profile,
          loading: false,
          error: null
        })

      } catch (error) {
        console.error('Error in initializeAuth:', error)
        if (mounted) {
          setState({
            user: null,
            profile: null,
            loading: false,
            error: 'Authentication failed'
          })
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('useAdminAuth: Auth state change:', event, session?.user?.id)
      
      if (!mounted) return

      const currentUser = session?.user || null
      
      if (currentUser) {
        const profile = await fetchUserProfile(currentUser.id)
        
        if (!mounted) return

        if (profile && checkAdminRole(profile)) {
          console.log('useAdminAuth: Auth state change - user authenticated as admin')
          setState({
            user: currentUser,
            profile,
            loading: false,
            error: null
          })
        } else {
          console.log('useAdminAuth: Auth state change - user not admin or no profile')
          setState({
            user: null,
            profile: null,
            loading: false,
            error: 'Admin access required'
          })
        }
      } else {
        console.log('useAdminAuth: Auth state change - no user')
        setState({
          user: null,
          profile: null,
          loading: false,
          error: null
        })
      }
    })

    return () => {
      mounted = false
      clearTimeout(loadingTimeout)
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const forceRefresh = async () => {
    console.log('useAdminAuth: Force refreshing authentication...')
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        setState({
          user: null,
          profile: null,
          loading: false,
          error: authError?.message || 'No user found'
        })
        return
      }

      const profile = await fetchUserProfile(user.id)
      
      if (profile && checkAdminRole(profile)) {
        setState({
          user,
          profile,
          loading: false,
          error: null
        })
      } else {
        setState({
          user: null,
          profile: null,
          loading: false,
          error: 'Admin access required'
        })
      }
    } catch (error) {
      setState({
        user: null,
        profile: null,
        loading: false,
        error: 'Authentication failed'
      })
    }
  }

  return {
    ...state,
    signOut,
    forceRefresh
  }
} 