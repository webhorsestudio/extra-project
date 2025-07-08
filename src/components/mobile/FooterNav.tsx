import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AiOutlineCompass, AiOutlineHeart, AiOutlineBell, AiOutlineMenu } from 'react-icons/ai';
import UserMenuDrawer from './UserMenuDrawer';

interface FooterNavProps {
  visible?: boolean;
  isTablet?: boolean;
}

// Navigation items configuration
const NAV_ITEMS = [
  {
    key: 'explore',
    icon: AiOutlineCompass,
    label: 'Explore',
    href: '/m',
  },
  {
    key: 'wishlist',
    icon: AiOutlineHeart,
    label: 'Wishlist',
    href: '/m/wishlist',
  },
  {
    key: 'notifications',
    icon: AiOutlineBell,
    label: 'Notifications',
    href: '/m/notifications',
  },
  {
    key: 'menu',
    icon: AiOutlineMenu,
    label: 'Menu',
    href: '#', // Will open drawer
  },
] as const;

export default function FooterNav({ visible = true, isTablet = false }: FooterNavProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <nav
        className={`fixed bottom-4 left-4 right-4 z-50 transition-all duration-300 ease-in-out
          ${visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-full pointer-events-none'}`}
      >
        <div className={`flex items-center justify-between bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 px-4 py-3
          ${isTablet ? 'min-h-[80px]' : 'min-h-[68px]'}`}>
          {NAV_ITEMS.map(({ key, icon: Icon, label, href }) => {
            const isActive = key === 'menu' ? false : pathname === href;
            
            return key === 'menu' ? (
              <button
                key={key}
                onClick={() => setDrawerOpen(true)}
                className={`flex items-center gap-2 rounded-xl transition-all duration-200 focus:outline-none
                  text-gray-600 hover:text-gray-900 hover:bg-white/60 active:scale-95
                  ${isTablet ? 'px-6 py-3' : 'px-4 py-2'}`}
                aria-label={label}
                type="button"
              >
                <Icon className={`${isTablet ? 'text-3xl' : 'text-2xl'}`} />
              </button>
            ) : (
              <Link
                key={key}
                href={href}
                className={`flex items-center gap-2 rounded-xl transition-all duration-200 focus:outline-none
                  ${isActive 
                    ? 'bg-white/90 text-gray-900 font-semibold shadow-md border border-white/30' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60 active:scale-95'
                  }
                  ${isTablet ? 'px-6 py-3' : 'px-4 py-2'}`}
                aria-label={label}
              >
                <Icon className={`${isTablet ? 'text-3xl' : 'text-2xl'}`} />
                {isActive && (
                  <span className={`${isTablet ? 'text-lg' : 'text-base'} font-semibold`}>
                    {label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
      <UserMenuDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
} 