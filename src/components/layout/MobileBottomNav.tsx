'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingCart, Heart, User } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';

interface NavTab {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  matchPaths?: string[];
}

const tabs: NavTab[] = [
  { label: 'Accueil', href: '/', icon: Home },
  { label: 'Recherche', href: '/recherche', icon: Search },
  { label: 'Panier', href: '/panier', icon: ShoppingCart },
  { label: 'Favoris', href: 'javascript:void(0)', icon: Heart },
  { label: 'Compte', href: '/compte', icon: User },
];

function getWishlistCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const stored = localStorage.getItem('le-marche-wishlist');
    if (stored) {
      const slugs: unknown[] = JSON.parse(stored);
      return Array.isArray(slugs) ? slugs.length : 0;
    }
  } catch {
    // ignore
  }
  return 0;
}

function subscribeToWishlist(callback: () => void): () => void {
  const onStorage = () => callback();
  const onCustom = () => callback();
  window.addEventListener('storage', onStorage);
  window.addEventListener('wishlist-updated', onCustom);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener('wishlist-updated', onCustom);
  };
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const items = useCartStore((s) => s.items);
  const wishlistCount = useSyncExternalStore(subscribeToWishlist, getWishlistCount, () => 0);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const isTabActive = (tab: NavTab): boolean => {
    if (tab.href === '/') return pathname === '/';
    if (tab.href.startsWith('javascript:')) return false;
    return pathname.startsWith(tab.href);
  };

  const handleFavorisClick = () => {
    // Navigate to compte page with wishlist tab
    window.location.hash = '#favoris';
    window.location.href = '/compte#favoris';
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 lg:hidden z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
      aria-label="Navigation mobile"
    >
      <div className="flex items-center justify-around h-16 px-1">
        {tabs.map((tab) => {
          const active = isTabActive(tab);
          const Icon = tab.icon;
          const showBadge =
            (tab.href === '/panier' && cartCount > 0) ||
            (tab.href.startsWith('javascript:') && wishlistCount > 0);
          const badgeValue =
            tab.href === '/panier' ? cartCount : wishlistCount;

          const linkContent = (
            <>
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-colors duration-200 ${
                    active
                      ? 'text-[#1B5E20]'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                />
                {showBadge && (
                  <span
                    className={`absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold leading-none rounded-full px-1 transition-transform duration-200 ${
                      active
                        ? 'bg-[#1B5E20] text-white scale-110'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {badgeValue > 99 ? '99+' : badgeValue}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium transition-colors duration-200 ${
                  active
                    ? 'text-[#1B5E20]'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {tab.label}
              </span>
            </>
          );

          const tabClasses = `flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-lg transition-all duration-200 ${
            active ? 'bg-green-50 dark:bg-green-900/20' : ''
          }`;

          if (tab.href.startsWith('javascript:')) {
            return (
              <button
                key={tab.label}
                onClick={handleFavorisClick}
                className={tabClasses}
                aria-label={tab.label}
              >
                {linkContent}
              </button>
            );
          }

          return (
            <Link key={tab.label} href={tab.href} className={tabClasses}>
              {linkContent}
            </Link>
          );
        })}
      </div>
      {/* Safe area inset for iPhones with home bar */}
      <div className="pb-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
