'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [installed, setInstalled] = useState(false);
  const installedRef = useRef(false);

  // Initialize installed state from media query (runs only on client)
  const standaloneMatch = typeof window !== 'undefined'
    ? window.matchMedia('(display-mode: standalone)').matches
    : false;
  const [isStandalone] = useState(standaloneMatch);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.warn('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    // Check if already installed
    if (isStandalone || installedRef.current) {
      return;
    }

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show banner after a short delay
      setTimeout(() => {
        setShowBanner(true);
      }, 3000);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      installedRef.current = true;
      setInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isStandalone]);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } catch {
      console.error('Install prompt failed');
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowBanner(false);
    // Don't show again in this session
    sessionStorage.setItem('pwa-banner-dismissed', 'true');
  }, []);

  // Don't render if already installed or banner dismissed
  if (isStandalone || installed || !showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 md:p-4">
      <div className="mx-auto max-w-lg rounded-xl border border-[#1B5E20]/20 bg-white shadow-xl">
        <div className="flex items-start gap-3 p-3 md:p-4">
          {/* Icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E8F5E9]">
            <Smartphone className="h-5 w-5 text-[#1B5E20]" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">
              Installer Le Marche Africain
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              Accedez rapidement a notre application depuis votre ecran d&apos;accueil
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 border-t border-gray-100 px-3 py-2 md:px-4">
          <Button
            onClick={handleInstall}
            className="h-9 flex-1 bg-[#1B5E20] text-xs font-medium text-white hover:bg-[#145216]"
          >
            <Download className="h-3.5 w-3.5" />
            Installer l&apos;application
          </Button>
          <Button
            variant="ghost"
            onClick={handleDismiss}
            className="h-9 text-xs text-gray-500 hover:text-gray-700"
          >
            Plus tard
          </Button>
        </div>
      </div>
    </div>
  );
}
