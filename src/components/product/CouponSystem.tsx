'use client';

import { useState, useCallback, useEffect } from 'react';
import { useProductStore, formatPrice } from '@/store/product-store';
import {
  Copy, Check, Gift, Tag, Clock, ShoppingCart,
  ChevronRight, Sparkles, AlertCircle, Percent,
  Truck, X,
} from 'lucide-react';

// ============================================================
// Coupon System — Codes promo & Offres spéciales
// Le Marché Africain
// ============================================================

interface CouponData {
  id: string;
  code: string;
  label: string;
  description: string;
  discountDisplay: string;
  discountGNF: number;
  conditions: string;
  expiresText: string;
  expiresDays: number;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  icon: 'percent' | 'truck' | 'tag';
}

const COUPONS: CouponData[] = [
  {
    id: 'afri50',
    code: 'AFRI50',
    label: 'Réduction Premium',
    description: '50 000 GNF de réduction',
    discountDisplay: '50 000 GNF',
    discountGNF: 50000,
    conditions: 'Commande min. 1 000 000 GNF',
    expiresText: 'Expire dans 2 jours',
    expiresDays: 2,
    accentColor: '#B8860B',
    accentBg: 'bg-[#FFF8E1]',
    accentBorder: 'border-[#FFD814]',
    icon: 'tag',
  },
  {
    id: 'premier15',
    code: 'PREMIER15',
    label: 'Bienvenue !',
    description: '15% de réduction',
    discountDisplay: '15%',
    discountGNF: 0, // percentage based
    conditions: 'Premier achat uniquement',
    expiresText: 'Expire dans 5 jours',
    expiresDays: 5,
    accentColor: '#2E7D32',
    accentBg: 'bg-[#E8F5E9]',
    accentBorder: 'border-[#2E7D32]',
    icon: 'percent',
  },
  {
    id: 'livraison',
    code: 'LIVRAISON',
    label: 'Livraison Offerte',
    description: 'Livraison gratuite',
    discountDisplay: 'Gratuit',
    discountGNF: 50000, // estimated delivery cost
    conditions: 'Commande +500 000 GNF',
    expiresText: 'Expire dans 3 jours',
    expiresDays: 3,
    accentColor: '#FF6600',
    accentBg: 'bg-[#FFF3E0]',
    accentBorder: 'border-[#FF6600]',
    icon: 'truck',
  },
];

// Circular cutout SVG for coupon edges
function CouponCutout({ side }: { side: 'left' | 'right' }) {
  return (
    <div className="absolute top-1/2 -translate-y-1/2 z-10">
      <div
        className={`h-6 w-6 rounded-full bg-white ${
          side === 'left' ? '-ml-3' : '-mr-3'
        }`}
        style={{ border: 'none' }}
      />
    </div>
  );
}

// Single Coupon Card
function CouponCard({ coupon, claimed, onClaim, copiedId, onCopy }: {
  coupon: CouponData;
  claimed: boolean;
  onClaim: (id: string) => void;
  copiedId: string | null;
  onCopy: (code: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const IconComponent = coupon.icon === 'percent'
    ? Percent
    : coupon.icon === 'truck'
      ? Truck
      : Tag;

  return (
    <div
      className={`relative flex flex-col justify-between min-w-[280px] max-w-[320px] rounded-xl border-2 border-dashed p-5 transition-all duration-200 ${
        claimed
          ? 'border-[#2E7D32] bg-[#E8F5E9] opacity-90'
          : `${coupon.accentBorder} ${coupon.accentBg} hover:shadow-md`
      } ${isHovered ? 'scale-[1.02]' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cutouts */}
      <CouponCutout side="left" />
      <CouponCutout side="right" />

      {/* Claimed overlay badge */}
      {claimed && (
        <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-[#2E7D32] px-2 py-0.5 text-[10px] font-medium text-white">
          <Check className="h-3 w-3" />
          Réclamé
        </div>
      )}

      {/* Header: icon + label */}
      <div className="mb-3 flex items-center gap-2">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: coupon.accentColor + '18' }}
        >
          <IconComponent className="h-[18px] w-[18px]" style={{ color: coupon.accentColor }} />
        </div>
        <div>
          <p className="text-xs font-semibold text-[#0F1111]">{coupon.label}</p>
          <p className="text-[10px] text-[#565959]">{coupon.expiresText}</p>
        </div>
      </div>

      {/* Discount Display */}
      <div className="mb-3 rounded-lg bg-white/70 p-3 text-center backdrop-blur-sm">
        <span
          className="text-2xl font-bold"
          style={{ color: coupon.accentColor }}
        >
          {coupon.discountDisplay}
        </span>
        <p className="mt-0.5 text-xs text-[#565959]">{coupon.description}</p>
      </div>

      {/* Conditions */}
      <p className="mb-3 flex items-center gap-1 text-[10px] text-[#717171]">
        <AlertCircle className="h-3 w-3" />
        {coupon.conditions}
      </p>

      {/* Coupon Code Display */}
      <div className="mb-3 flex items-center justify-center gap-2">
        <div className="flex items-center rounded-md border border-dashed border-[#BBB] bg-white px-3 py-1.5">
          <Tag className="mr-1.5 h-3 w-3 text-[#717171]" />
          <span className="text-sm font-bold tracking-wider" style={{ color: coupon.accentColor }}>
            {coupon.code}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onCopy(coupon.code)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#D5D9D9] bg-white px-3 py-2 text-xs font-medium text-[#0F1111] transition-all hover:bg-[#F7F8F8] active:scale-[0.97]"
        >
          {copiedId === coupon.code ? (
            <>
              <Check className="h-3.5 w-3.5 text-[#2E7D32]" />
              <span className="text-[#2E7D32]">Copié !</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copier
            </>
          )}
        </button>
        {!claimed && (
          <button
            onClick={() => onClaim(coupon.id)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-white transition-all hover:opacity-90 active:scale-[0.97]"
            style={{ backgroundColor: coupon.accentColor }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Réclamer
          </button>
        )}
      </div>
    </div>
  );
}

// Main CouponSystem Component
export function CouponSystem() {
  const { selectedCurrency } = useProductStore();

  // Coupon state
  const [claimedCoupons, setClaimedCoupons] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [inputStatus, setInputStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [inputMessage, setInputMessage] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successToastMessage, setSuccessToastMessage] = useState('');

  // Show/hide limited offer banner
  const [showLimitedOffer, setShowLimitedOffer] = useState(true);

  // Copy to clipboard handler
  const handleCopy = useCallback(async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(code);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedId(code);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }, []);

  // Show toast notification
  const showToast = useCallback((message: string) => {
    setSuccessToastMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3500);
  }, []);

  // Claim coupon handler
  const handleClaim = useCallback((id: string) => {
    setClaimedCoupons((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    const coupon = COUPONS.find((c) => c.id === id);
    if (coupon) {
      showToast(`Coupon "${coupon.code}" réclamé avec succès !`);
    }
  }, [showToast]);

  // Auto-hide success toast
  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => setShowSuccessToast(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast]);

  // Validate and apply coupon code
  const handleApplyCoupon = useCallback(() => {
    const trimmed = couponInput.trim().toUpperCase();

    if (!trimmed) {
      setInputStatus('error');
      setInputMessage('Veuillez entrer un code promo.');
      return;
    }

    const match = COUPONS.find(
      (c) => c.code === trimmed
    );

    if (match) {
      if (claimedCoupons.has(match.id)) {
        setInputStatus('error');
        setInputMessage(`Le code "${match.code}" est déjà appliqué.`);
        return;
      }
      setClaimedCoupons((prev) => {
        const next = new Set(prev);
        next.add(match.id);
        return next;
      });
      setInputStatus('success');
      setInputMessage(`Code "${match.code}" appliqué avec succès !`);
      showToast(`Code "${match.code}" appliqué — ${match.discountDisplay} de réduction !`);
      setCouponInput('');
    } else {
      setInputStatus('error');
      setInputMessage('Code promo invalide. Vérifiez et réessayez.');
    }

    // Clear input status after 5s
    setTimeout(() => {
      setInputStatus('idle');
      setInputMessage('');
    }, 5000);
  }, [couponInput, claimedCoupons, showToast]);

  // Calculate total savings
  const totalSavingsGNF = COUPONS
    .filter((c) => claimedCoupons.has(c.id))
    .reduce((sum, c) => sum + c.discountGNF, 0);

  const claimedCount = claimedCoupons.size;

  return (
    <div className="space-y-5">
      {/* Success Toast */}
      <div
        className={`fixed top-20 left-1/2 z-50 -translate-x-1/2 transition-all duration-300 ${
          showSuccessToast
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : '-translate-y-4 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2 rounded-xl bg-[#2E7D32] px-5 py-3 text-white shadow-lg">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
            <Check className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-medium">{successToastMessage}</span>
        </div>
      </div>

      {/* Section Header */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFD814]/20">
          <TicketIcon className="h-[18px] w-[18px] text-[#B8860B]" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-[#0F1111]">Codes Promo & Offres</h3>
          <p className="text-xs text-[#565959]">Économisez plus sur votre commande</p>
        </div>
      </div>

      {/* Available Coupons — Horizontal scroll on mobile */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin md:flex-wrap md:justify-start">
        {COUPONS.map((coupon) => (
          <CouponCard
            key={coupon.id}
            coupon={coupon}
            claimed={claimedCoupons.has(coupon.id)}
            onClaim={handleClaim}
            copiedId={copiedId}
            onCopy={handleCopy}
          />
        ))}
      </div>

      {/* Coupon Code Input */}
      <div className="rounded-xl border border-[#D5D9D9] bg-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <Tag className="h-4 w-4 text-[#565959]" />
          <span className="text-sm font-medium text-[#0F1111]">Vous avez un code promo ?</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={couponInput}
            onChange={(e) => {
              setCouponInput(e.target.value);
              if (inputStatus !== 'idle') {
                setInputStatus('idle');
                setInputMessage('');
              }
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
            placeholder="Entrez votre code promo..."
            className={`flex-1 rounded-lg border bg-[#F7F8F8] px-4 py-2.5 text-sm outline-none transition-colors ${
              inputStatus === 'error'
                ? 'border-[#CC0C39] bg-[#FFF5F5] focus:border-[#CC0C39]'
                : inputStatus === 'success'
                  ? 'border-[#2E7D32] bg-[#E8F5E9] focus:border-[#2E7D32]'
                  : 'border-[#D5D9D9] focus:border-[#2E7D32]'
            }`}
          />
          <button
            onClick={handleApplyCoupon}
            disabled={!couponInput.trim()}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-[#2E7D32] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#1B5E20] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Appliquer
          </button>
        </div>
        {/* Input feedback message */}
        {inputMessage && (
          <div
            className={`mt-2 flex items-center gap-1.5 text-xs ${
              inputStatus === 'error' ? 'text-[#CC0C39]' : 'text-[#2E7D32]'
            }`}
          >
            {inputStatus === 'error' ? (
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <Check className="h-3.5 w-3.5 shrink-0" />
            )}
            {inputMessage}
          </div>
        )}
      </div>

      {/* Savings Calculator */}
      {claimedCount > 0 && (
        <div className="rounded-xl border border-[#2E7D32]/30 bg-gradient-to-r from-[#E8F5E9] to-[#F1F8E9] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2E7D32]">
                <Gift className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-[#2E7D32]/80">Votre économie totale</p>
                <p className="text-lg font-bold text-[#1B5E20]">
                  {totalSavingsGNF > 0
                    ? formatPrice(totalSavingsGNF, selectedCurrency)
                    : 'Réduction appliquée'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-[#2E7D32] px-3 py-1">
              <Check className="h-3.5 w-3.5 text-white" />
              <span className="text-xs font-medium text-white">
                {claimedCount} coupon{claimedCount > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Breakdown */}
          <div className="mt-3 space-y-1.5 border-t border-[#2E7D32]/20 pt-3">
            {COUPONS.filter((c) => claimedCoupons.has(c.id)).map((c) => (
              <div key={c.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.accentColor }} />
                  <span className="text-[#565959]">{c.code}</span>
                </div>
                <span className="font-medium text-[#1B5E20]">
                  -{c.discountDisplay}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Limited Offer Banner */}
      {showLimitedOffer && (
        <div className="relative overflow-hidden rounded-xl border border-[#FF6600]/30 bg-gradient-to-r from-[#FFF3E0] via-[#FFF8E1] to-[#FFF3E0] p-4">
          {/* Dismiss button */}
          <button
            onClick={() => setShowLimitedOffer(false)}
            className="absolute top-2 right-2 rounded-full p-1 transition-colors hover:bg-black/5"
            aria-label="Fermer"
          >
            <X className="h-3.5 w-3.5 text-[#717171]" />
          </button>

          {/* Decorative confetti dots */}
          <div className="absolute top-1 left-6 h-2 w-2 rounded-full bg-[#FFD814] opacity-60" />
          <div className="absolute top-3 right-24 h-1.5 w-1.5 rounded-full bg-[#FF6600] opacity-40" />
          <div className="absolute bottom-3 left-20 h-2.5 w-2.5 rounded-full bg-[#2E7D32] opacity-30" />
          <div className="absolute bottom-1 right-12 h-1.5 w-1.5 rounded-full bg-[#FFD814] opacity-50" />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FF6600] shadow-sm">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wide text-[#FF6600]">
                    Offre Spéciale
                  </span>
                  <span className="rounded bg-[#CC0C39] px-1.5 py-0.5 text-[10px] font-bold text-white">
                    -10%
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#0F1111]">
                  Ajoutez 2 articles au panier et recevez{' '}
                  <span className="font-bold text-[#CC0C39]">-10% supplémentaire</span> !
                </p>
                <div className="mt-1.5 flex items-center gap-1 text-[10px] text-[#717171]">
                  <Clock className="h-3 w-3" />
                  <span>Offre limitée • Se termine bientôt</span>
                </div>
              </div>
            </div>
            <button
              className="flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#FF6600] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#E65100] active:scale-[0.97]"
            >
              <ShoppingCart className="h-4 w-4" />
              En profiter
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* All claimed empty state */}
      {claimedCount === COUPONS.length && (
        <div className="rounded-xl border border-dashed border-[#2E7D32]/40 bg-[#E8F5E9]/50 p-4 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#2E7D32]/10">
            <Check className="h-5 w-5 text-[#2E7D32]" />
          </div>
          <p className="text-sm font-medium text-[#1B5E20]">Tous les coupons ont été réclamés !</p>
          <p className="mt-0.5 text-xs text-[#565959]">
            Vos réductions seront appliquées lors du paiement.
          </p>
        </div>
      )}
    </div>
  );
}

// Simple ticket icon since lucide doesn't have one built-in
function TicketIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </svg>
  );
}

export default CouponSystem;
