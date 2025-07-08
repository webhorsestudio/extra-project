'use client'

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import SearchBar from "./search/SearchBar";
import { Skeleton } from "@/components/ui/skeleton";
import UserMenuButton from '@/components/web/ui/UserMenuButton'
import { supabase } from '@/lib/supabaseClient';
import { ConfigurationData } from '@/lib/configuration-data-client'
import { BudgetData } from '@/lib/budget-data'
import { Location } from '@/hooks/useLocations'

// Proper TypeScript interfaces
interface User {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
  }
}

interface UserProfile {
  id: string
  full_name: string
  avatar_data?: string | null
  role: string
  created_at: string
  updated_at: string
}

interface UserState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
}

interface NavbarProps {
  logoUrl?: string | null
  logoAlt?: string
  hasLogo?: boolean
  siteTitle?: string
  locations?: Location[]
  configurationData?: ConfigurationData
  budgetData?: BudgetData
  initialUser?: {
    name?: string
    avatar?: string | null
    role?: string
  } | null
}

export default function Navbar({ 
  logoUrl, 
  logoAlt = 'Company Logo', 
  hasLogo = false,
  siteTitle = 'Property',
  locations = [],
  configurationData,
  budgetData,
  initialUser = null
}: NavbarProps) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [logoLoading, setLogoLoading] = useState(false);
  const [userState, setUserState] = useState<UserState>({
    user: null,
    profile: null,
    loading: !initialUser,
    error: null
  });

  // Improved user and profile fetching with proper error handling
  const fetchUserAndProfile = useCallback(async () => {
    try {
      setUserState(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('Fetching user and profile...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting user:', userError);
        setUserState({
          user: null,
          profile: null,
          loading: false,
          error: userError.message
        });
        return;
      }
      
      if (!user) {
        console.log('No user found');
        setUserState({
          user: null,
          profile: null,
          loading: false,
          error: null
        });
        return;
      }

      console.log('User found, fetching profile...');
      // Fetch user profile to get role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        setUserState({
          user,
          profile: null,
          loading: false,
          error: profileError.message
        });
        return;
      }

      if (!profile) {
        console.error('No profile found for user');
        setUserState({
          user,
          profile: null,
          loading: false,
          error: 'Profile not found'
        });
        return;
      }

      console.log('Profile fetched successfully:', profile.role);
      setUserState({
        user,
        profile,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserState({
        user: null,
        profile: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, []);

  // Improved auth state change handler
  const handleAuthChange = useCallback(async (event: string, session: any) => {
    console.log('Auth state changed:', event, session?.user?.email);
    
    try {
      const currentUser = session?.user || null;
      
      if (!currentUser) {
        setUserState({
          user: null,
          profile: null,
          loading: false,
          error: null
        });
        return;
      }

      // Fetch user profile to get role
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        setUserState({
          user: currentUser,
          profile: null,
          loading: false,
          error: error.message
        });
        return;
      }

      if (!profile) {
        setUserState({
          user: currentUser,
          profile: null,
          loading: false,
          error: 'Profile not found'
        });
        return;
      }

      setUserState({
        user: currentUser,
        profile,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error in auth state change:', error);
      setUserState({
        user: null,
        profile: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, []);

  useEffect(() => {
    // If we have initial user data from SSR, use it
    if (initialUser) {
      setUserState({
        user: { id: 'initial', email: initialUser.name || '', user_metadata: { full_name: initialUser.name } },
        profile: {
          id: 'initial',
          full_name: initialUser.name || '',
          avatar_data: initialUser.avatar,
          role: initialUser.role || 'customer',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        loading: false,
        error: null
      });
      return;
    }

    fetchUserAndProfile();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => subscription.unsubscribe();
  }, [fetchUserAndProfile, handleAuthChange, initialUser]);

  const userObj = useMemo(() => {
    if (!userState.user || !userState.profile) return null;
    return {
      name: userState.profile.full_name || userState.user.user_metadata?.full_name || userState.user.email || 'Unknown User',
      avatar: userState.profile.avatar_data || null,
      role: userState.profile.role as 'admin' | 'agent' | 'customer' | undefined,
    };
  }, [userState.user, userState.profile]);

  const handleSignIn = useCallback(() => {
    router.push('/users/login');
  }, [router]);

  // Simplified logo fetching with proper loading state
  const fetchLogoImage = useCallback(async () => {
    if (!logoUrl || !hasLogo) {
      setImageUrl(null);
      setLogoLoading(false);
      return;
    }

    setLogoLoading(true);
    
    // Set the image URL immediately if available
    setImageUrl(logoUrl);
    setLogoLoading(false);
  }, [logoUrl, hasLogo]);

  useEffect(() => {
    fetchLogoImage();
  }, [fetchLogoImage]);

  const renderLogo = useCallback(() => {
    // Show skeleton while logo is loading
    if (logoLoading) {
      return (
        <Skeleton className="h-11 w-40 bg-gray-200" />
      );
    }

    // Show actual logo if available
    if (imageUrl && hasLogo) {
      return (
        <div className="relative h-11 w-40">
          <Image
            src={imageUrl}
            alt={logoAlt}
            fill
            style={{ objectFit: 'contain' }}
            unoptimized
            priority
          />
        </div>
      );
    }

    // Fallback logo only if no logo is configured
    return (
      <div className="h-11 w-40 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white font-bold text-lg">
        {siteTitle}
      </div>
    );
  }, [logoLoading, imageUrl, hasLogo, logoAlt, siteTitle]);

  useEffect(() => {
    console.log('Navbar: locations prop =', locations)
    console.log('Navbar: locations count =', locations.length)
  }, [locations])

  useEffect(() => {
    console.log('Navbar: configurationData =', configurationData)
  }, [configurationData])

  useEffect(() => {
    console.log('Navbar: budgetData =', budgetData)
  }, [budgetData])

  return (
    <header className="bg-white border-b border-gray-100 py-3 shadow-sm">
      <nav className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between" style={{ minHeight: 68 }}>
          <div className="flex-shrink-0">
            <Link href="/" className="block">
              {renderLogo()}
            </Link>
          </div>

          <SearchBar locations={locations} configurationData={configurationData} budgetData={budgetData} />
          
          <div className="hidden md:flex items-center gap-4">
            <UserMenuButton 
              user={userObj} 
              onSignIn={handleSignIn} 
              isLoading={userState.loading} 
            />
          </div>
        </div>
      </nav>
    </header>
  );
}
