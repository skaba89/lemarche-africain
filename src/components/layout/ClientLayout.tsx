'use client';

import { useState, useCallback } from 'react';
import SharedHeader from './SharedHeader';
import SharedFooter from './SharedFooter';
import { Toaster } from '@/components/ui/sonner';
import PWAInstall from '@/components/PWAInstall';
import CookieConsent from '@/components/CookieConsent';
import ComparisonBar from '@/components/product/ComparisonBar';
import ComparisonDrawer from '@/components/product/ComparisonDrawer';
import QuickView from '@/components/product/QuickView';
import ChatWidget from '@/components/chat/ChatWidget';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { useQuickViewStore } from '@/store/quick-view-store';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const quickView = useQuickViewStore();

  const handleOpenComparison = useCallback(() => {
    setIsComparisonOpen(true);
  }, []);

  const handleCloseComparison = useCallback(() => {
    setIsComparisonOpen(false);
  }, []);

  return (
    <>
      <SharedHeader />
      <main id="main-content" role="main" className="min-h-screen flex flex-col">{children}</main>
      <SharedFooter />
      <ComparisonBar onCompare={handleOpenComparison} />
      <CookieConsent />
      <ComparisonDrawer isOpen={isComparisonOpen} onClose={handleCloseComparison} />
      <Toaster />
      <PWAInstall />
      <ChatWidget />
      <QuickView isOpen={quickView.isOpen} onClose={quickView.close} productSlug={quickView.slug || ''} />
      <MobileBottomNav />
    </>
  );
}
