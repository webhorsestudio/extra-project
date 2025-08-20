import React, { useEffect, useState } from 'react';
import { X, User, Phone, Headphones, FileText, HelpCircle, LogOut, MessageSquare, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image'

interface UserMenuDrawerProps {
  open: boolean;
  onClose: () => void;
}

// Proper TypeScript interfaces
interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface UserProfile {
  id: string;
  full_name: string;
  avatar_data?: string | null;
  role: string;
  phone?: string;
}

export default function UserMenuDrawer({ open, onClose }: UserMenuDrawerProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restore scroll position and body styles
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [open]);

  useEffect(() => {
    let mounted = true;
    async function fetchUserProfile() {
      setLoading(true);
      try {
        const res = await fetch('/api/mobile/user');
        if (!res.ok) {
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (mounted) {
          setUser(data.user);
          setProfile(data.profile);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        if (mounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    }
    if (open) fetchUserProfile();
    return () => { mounted = false; };
  }, [open]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: 'Logout Failed',
          description: error.message || 'An error occurred during logout.',
          variant: 'destructive',
        });
        setLoggingOut(false);
        return;
      }
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully.',
      });
      setUser(null);
      setProfile(null);
      setLoggingOut(false);
      onClose();
      router.push('/users/login');
    } catch (error) {
      toast({
        title: 'Logout Failed',
        description: error instanceof Error ? error.message : 'An error occurred during logout.',
        variant: 'destructive',
      });
      setLoggingOut(false);
    }
  };

  const menuItems = [
    ...(user ? [
      { label: 'Wishlist', icon: <Heart className="w-6 h-6" />, href: '/m/wishlist' },
      { label: 'Profile', icon: <User className="w-6 h-6" />, href: '/m/profile' },
      { label: 'Notifications', icon: <MessageSquare className="w-6 h-6" />, href: '/m/notifications' },
    ] : []),
    { label: 'Public Listing', icon: <FileText className="w-6 h-6" />, href: '/m/public-listings' },
    { label: 'Contact Us', icon: <Phone className="w-6 h-6" />, href: '/m/contact' },
    { label: 'Support', icon: <Headphones className="w-6 h-6" />, href: '/m/support' },
    { label: 'Terms Of Use', icon: <FileText className="w-6 h-6" />, href: '/m/terms' },
    { label: 'Privacy Policy', icon: <FileText className="w-6 h-6" />, href: '/m/privacy' },
    { label: 'FAQs', icon: <HelpCircle className="w-6 h-6" />, href: '/m/faqs' },
  ];

  // Mobile-specific navigation handler
  const handleMobileNavigation = (href: string) => {
    // Ensure we're on mobile route
    if (!href.startsWith('/m/')) {
      console.error('❌ Invalid mobile route:', href)
      return
    }
    
    // Prevent event bubbling
    event?.stopPropagation()
    event?.preventDefault()
    
    // Close drawer first
    onClose()
    
    // Small delay to ensure drawer closes before navigation
    setTimeout(() => {
      // Use window.location for mobile navigation to ensure it works
      if (href === '/m/public-listings') {
        window.location.href = href
      } else {
        router.push(href)
      }
    }, 100)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      {/* Drawer */}
      <aside
        className={`mobile-navigation-drawer fixed top-0 right-0 h-full z-50 bg-white/90 backdrop-blur-md shadow-2xl border-l border-gray-200/50 transition-transform duration-300 ease-in-out flex flex-col
          ${open ? 'translate-x-0' : 'translate-x-full'}
        `}
        style={{ width: '80vw', maxWidth: 360 }}
        role="dialog"
        aria-modal="true"
        data-mobile-navigation="true"
        data-testid="mobile-user-menu-drawer"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200/50 bg-white/50">
          {loading ? (
            <div className="w-full h-10 bg-gray-100/80 rounded-xl animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-3">
              {profile?.avatar_data ? (
                <Image src={profile.avatar_data || ''} alt={profile.full_name || user.email || 'User'} className="w-12 h-12 rounded-full object-cover border-2 border-white/50 shadow-sm" width={48} height={48} />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 text-2xl font-bold border-2 border-white/50 shadow-sm">
                  {profile?.full_name?.[0] || user.email?.[0] || 'U'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-lg text-gray-900 truncate">
                  {profile?.full_name || user.email}
                </div>
                <div className="text-gray-500 text-sm truncate">
                  {profile?.phone || user.email}
                </div>
                {profile?.role && (
                  <div className="text-xs text-blue-600 font-medium capitalize">
                    {profile.role}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Button className="w-full bg-white/80 hover:bg-white/90 border border-gray-300/50" variant="outline" size="lg" asChild>
              <a href="/users/login">Sign In</a>
            </Button>
          )}
          <button onClick={onClose} className="ml-4 p-2 rounded-xl hover:bg-gray-100/80 focus:outline-none transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
                 {/* Menu Items */}
         <nav className="flex-1 overflow-y-auto py-2">
           <ul className="flex flex-col divide-y divide-gray-200/50">
                           {menuItems.map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => handleMobileNavigation(item.href)}
                    className={`mobile-menu-item flex items-center gap-4 px-6 py-5 text-base text-gray-700 hover:bg-gray-50/80 hover:text-gray-900 transition-all duration-200 focus:bg-gray-100/80 outline-none w-full text-left`}
                    tabIndex={0}
                    data-mobile-menu-item="true"
                    data-mobile-route={item.href}
                    data-mobile-label={item.label}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
           </ul>
         </nav>
        {/* Footer (Log Out) */}
        {user && (
          <div className="border-t border-gray-200/50 px-6 py-4 bg-white/30">
            <button
              type="button"
              className="flex items-center gap-3 text-base text-gray-700 hover:text-red-600 font-semibold w-full py-3 rounded-xl hover:bg-red-50/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              tabIndex={0}
              onClick={handleLogout}
              disabled={loggingOut}
            >
              <LogOut className="w-6 h-6" />
              {loggingOut ? 'Logging out...' : 'Log Out'}
            </button>
          </div>
        )}
      </aside>
    </>
  );
} 