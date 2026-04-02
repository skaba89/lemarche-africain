'use client';

import { useState, useEffect } from 'react';
import { Shield, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  social: boolean;
}

const COOKIE_CONSENT_KEY = 'le-marche-cookie-consent';

const COOKIE_DESCRIPTIONS: { key: keyof CookiePreferences; label: string; description: string; required: boolean }[] = [
  {
    key: 'essential',
    label: 'Cookies essentiels',
    description: 'Nécessaires au fonctionnement du site. Ils ne peuvent pas être désactivés.',
    required: true,
  },
  {
    key: 'analytics',
    label: 'Cookies analytiques',
    description: 'Nous permettent de comprendre comment vous utilisez le site pour l\'améliorer.',
    required: false,
  },
  {
    key: 'marketing',
    label: 'Cookies marketing',
    description: 'Utilisés pour personnaliser les offres et publicités en fonction de vos centres d\'intérêt.',
    required: false,
  },
  {
    key: 'social',
    label: 'Cookies de réseaux sociaux',
    description: 'Permettent le partage de contenu et l\'interaction avec les réseaux sociaux.',
    required: false,
  },
];

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: true,
    marketing: true,
    social: true,
  });

  // Check if user has already consented
  useEffect(() => {
    try {
      const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!stored) {
        // Show banner after a short delay for better UX
        const timer = setTimeout(() => setVisible(true), 1500);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage not available, show banner
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs));
      setVisible(false);
      setShowCustomize(false);
      toast.success('Pr\u00e9f\u00e9rences enregistr\u00e9es');
    } catch {
      toast.error('Erreur lors de l\'enregistrement des pr\u00e9f\u00e9rences');
    }
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      social: true,
    };
    savePreferences(allAccepted);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
  };

  const handleToggle = (key: keyof CookiePreferences) => {
    if (key === 'essential') return; // Cannot disable essential cookies
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-4 duration-500"
    >
      <div className="mx-auto max-w-3xl px-4 pb-4">
        <div className="rounded-t-lg rounded-b-lg bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
          {/* Main content */}
          <div className="p-5">
            <div className="flex items-start gap-3">
              <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F5E9]">
                <Shield className="h-5 w-5 text-[#1B5E20]" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Protection de vos donn&eacute;es
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Nous utilisons des cookies pour am&eacute;liorer votre exp&eacute;rience, analyser le trafic et personnaliser les offres. En continuant, vous acceptez notre politique de cookies.
                </p>
              </div>
            </div>

            {/* Customize panel */}
            {showCustomize && (
              <div className="mt-4 space-y-3 border-t border-gray-100 dark:border-gray-800 pt-4">
                {COOKIE_DESCRIPTIONS.map((cookie) => (
                  <div
                    key={cookie.key}
                    className={`flex items-start gap-3 rounded-lg p-3 ${
                      cookie.required ? 'bg-gray-50 dark:bg-gray-800/50' : ''
                    }`}
                  >
                    <Switch
                      id={`cookie-${cookie.key}`}
                      checked={preferences[cookie.key]}
                      onCheckedChange={() => handleToggle(cookie.key)}
                      disabled={cookie.required}
                      className="mt-0.5 data-[state=checked]:bg-[#1B5E20]"
                    />
                    <div className="flex-1 min-w-0">
                      <label
                        htmlFor={`cookie-${cookie.key}`}
                        className={`text-xs font-medium ${
                          cookie.required
                            ? 'text-gray-900 dark:text-gray-200'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {cookie.label}
                        {cookie.required && (
                          <span className="ml-1.5 text-[10px] font-normal text-[#1B5E20]">
                            (Requis)
                          </span>
                        )}
                      </label>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {cookie.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Button
              onClick={handleAcceptAll}
              className="bg-[#1B5E20] hover:bg-[#145218] text-white text-sm font-medium flex-1 sm:flex-none px-6 h-9"
            >
              <Check className="h-4 w-4 mr-1.5" />
              Tout accepter
            </Button>
            <div className="flex items-center gap-2 flex-1 sm:flex-none">
              <Button
                variant="outline"
                onClick={() => setShowCustomize(!showCustomize)}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium flex-1 sm:flex-none px-4 h-9"
              >
                <ChevronDown className={`h-4 w-4 mr-1.5 transition-transform ${showCustomize ? 'rotate-180' : ''}`} />
                Personnaliser
              </Button>
              {showCustomize && (
                <Button
                  variant="outline"
                  onClick={handleSavePreferences}
                  className="border-[#1B5E20] text-[#1B5E20] hover:bg-[#E8F5E9] text-sm font-medium flex-1 sm:flex-none px-4 h-9"
                >
                  Enregistrer
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
