'use client';

import { useEffect, useState } from 'react';
import { useProductStore, socialProofEvents, countries } from '@/store/product-store';
import { X, ChevronDown, Globe, ShoppingCart } from 'lucide-react';

// ============================================================
// Social Proof Notification — "X vient d'acheter..."
// ============================================================

export function SocialProofNotification() {
  const { socialProofIndex, nextSocialProof, showSocialProof, selectedCountry } = useProductStore();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!showSocialProof) return;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        nextSocialProof();
        setVisible(true);
      }, 500);
    }, 6000);
    return () => clearInterval(interval);
  }, [showSocialProof, nextSocialProof]);

  if (!showSocialProof || !visible) return null;

  const event = socialProofEvents[socialProofIndex];
  const countryFlag = countries.find((c) => c.code === event.country)?.flag || "";

  return (
    <div className="fixed bottom-20 left-4 z-30 animate-[slideUp_0.4s_ease-out] md:bottom-6 md:left-6">
      <div className="flex items-center gap-3 rounded-xl border border-[#DDD] bg-white px-4 py-3 shadow-lg max-w-[320px]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8F5E9]">
          <ShoppingCart className="h-5 w-5 text-[#2E7D32]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[#0F1111]">
            <span className="font-medium">{event.buyer}</span> ({countryFlag} {event.city})
          </p>
          <p className="text-[11px] text-[#444]">vient d&apos;acheter ce produit</p>
          <p className="text-[10px] text-[#999]">{event.time}</p>
        </div>
        <button onClick={() => useProductStore.setState({ showSocialProof: false })}
          className="shrink-0 text-[#999] hover:text-[#444]">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Country & Currency Selector
// ============================================================

export function CountrySelector() {
  const { selectedCountry, selectedCurrency, setSelectedCountry, setSelectedCurrency } = useProductStore();
  const [open, setOpen] = useState(false);

  const westAfrica = countries.filter((c) => ["GN", "SN", "ML", "CI", "NE", "BF"].includes(c.code));
  const centralAfrica = countries.filter((c) => ["CM", "TD", "GA", "CG"].includes(c.code));

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs text-white transition hover:bg-white/20"
      >
        <Globe className="h-3.5 w-3.5" />
        <span>{selectedCountry.flag} {selectedCountry.name}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-50" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-[#DDD] bg-white py-2 shadow-2xl">
            <div className="px-3 py-2 text-xs font-medium text-[#444] uppercase tracking-wider">Afrique de l&apos;Ouest</div>
            {westAfrica.map((c) => (
              <button key={c.code}
                onClick={() => { setSelectedCountry(c.code); setOpen(false); }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition ${
                  selectedCountry.code === c.code ? 'bg-[#E8F5E9] text-[#1B5E20] font-medium' : 'text-[#0F1111] hover:bg-[#F7F8F8]'
                }`}>
                <span className="text-base">{c.flag}</span>
                <span className="flex-1 text-left">{c.name}</span>
                <span className="text-[10px] text-[#999]">{c.currency}</span>
              </button>
            ))}

            <div className="mx-3 my-1 border-t border-[#EEE]" />
            <div className="px-3 py-2 text-xs font-medium text-[#444] uppercase tracking-wider">Afrique Centrale</div>
            {centralAfrica.map((c) => (
              <button key={c.code}
                onClick={() => { setSelectedCountry(c.code); setOpen(false); }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition ${
                  selectedCountry.code === c.code ? 'bg-[#E8F5E9] text-[#1B5E20] font-medium' : 'text-[#0F1111] hover:bg-[#F7F8F8]'
                }`}>
                <span className="text-base">{c.flag}</span>
                <span className="flex-1 text-left">{c.name}</span>
                <span className="text-[10px] text-[#999]">{c.currency}</span>
              </button>
            ))}

            <div className="mx-3 my-1 border-t border-[#EEE]" />
            <div className="px-3 py-2 text-xs font-medium text-[#444] uppercase tracking-wider">Devise</div>
            <div className="px-3 pb-1 flex flex-wrap gap-1.5">
              {(["GNF", "XOF", "XAF", "EUR", "USD"] as const).map((cur) => (
                <button key={cur} onClick={() => setSelectedCurrency(cur)}
                  className={`rounded-full border px-2.5 py-1 text-[10px] font-medium transition ${
                    selectedCurrency === cur
                      ? 'border-[#1B5E20] bg-[#E8F5E9] text-[#1B5E20]'
                      : 'border-[#DDD] text-[#444] hover:border-[#999]'
                  }`}>
                  {cur}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
