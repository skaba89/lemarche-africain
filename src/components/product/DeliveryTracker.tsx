'use client';

import { useState } from 'react';
import { useProductStore, formatPrice } from '@/store/product-store';
import { product } from '@/data/product';
import {
  Store,
  Truck,
  Check,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  CircleDot,
  Banknote,
  PackageCheck,
  Timer,
  Route,
  CircleCheckBig,
  Zap,
  Building2,
  Home,
  Trees,
} from 'lucide-react';

// ============================================================
// Delivery Tracker — Options de livraison & suivi
// Le Marché Africain
// ============================================================

// Country-specific delivery fees (GNF)
const DELIVERY_FEES: Record<string, { capital: number; otherCities: number; rural: number }> = {
  GN: { capital: 25000, otherCities: 45000, rural: 65000 },
  SN: { capital: 30000, otherCities: 50000, rural: 75000 },
  ML: { capital: 35000, otherCities: 55000, rural: 80000 },
  CI: { capital: 25000, otherCities: 45000, rural: 70000 },
  CM: { capital: 40000, otherCities: 65000, rural: 90000 },
  NE: { capital: 45000, otherCities: 70000, rural: 95000 },
  BF: { capital: 35000, otherCities: 55000, rural: 80000 },
  TD: { capital: 50000, otherCities: 75000, rural: 100000 },
  GA: { capital: 40000, otherCities: 60000, rural: 85000 },
  CG: { capital: 40000, otherCities: 60000, rural: 85000 },
};

// Delivery timeline steps
const DELIVERY_STEPS = [
  { id: 'confirmed', label: 'Commande confirmée', icon: PackageCheck },
  { id: 'preparing', label: 'En préparation', icon: Timer },
  { id: 'shipping', label: 'En route', icon: Route },
  { id: 'delivered', label: 'Livré', icon: CircleCheckBig },
] as const;

function getDeliveryZoneInfo(countryCode: string, selectedCity: string, capital: string) {
  const cityLower = selectedCity.toLowerCase();
  const capitalLower = capital.toLowerCase();

  if (cityLower === capitalLower) {
    return { zone: 'Capitale', days: '1-2 jours', feeKey: 'capital' as const };
  }
  return { zone: 'Autres villes', days: '3-5 jours', feeKey: 'otherCities' as const };
}

// --------------------------------------------------------
// Pickup Point Card
// --------------------------------------------------------
function PickupPointCard() {
  const { selectedCountry, selectedCity, selectedCurrency, deliveryType, setDeliveryType, setSelectedPickupPoint, selectedPickupPoint } = useProductStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const isActive = deliveryType === 'pickup';
  const nearestPoints = product.pickupPoints.slice(0, 3);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleSelectPickup = (id: string) => {
    setSelectedPickupPoint(id);
    setDeliveryType('pickup');
  };

  return (
    <button
      type="button"
      onClick={() => setDeliveryType('pickup')}
      className={`relative flex flex-col rounded-xl border-2 p-4 text-left transition-all duration-300 sm:p-5 ${
        isActive
          ? 'border-[#2E7D32] bg-[#E8F5E9]/60 shadow-sm'
          : 'border-[#D5D9D9] bg-white hover:border-[#2E7D32]/40 hover:shadow-sm'
      }`}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-[#2E7D32] px-2.5 py-0.5">
          <Check className="h-3 w-3 text-white" />
          <span className="text-[10px] font-medium text-white">Sélectionné</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
          isActive ? 'bg-[#2E7D32]' : 'bg-[#2E7D32]/10'
        }`}>
          <Store className={`h-5 w-5 ${isActive ? 'text-white' : 'text-[#2E7D32]'}`} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#0F1111]">Point de Retrait</h4>
          <p className="text-xs text-[#565959]">Gratuit • Retrait en magasin</p>
        </div>
      </div>

      {/* Free badge */}
      <div className="mb-4 flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-[#2E7D32]/10 px-3 py-1 text-xs font-semibold text-[#2E7D32]">
          <Zap className="h-3 w-3" />
          Livraison GRATUITE
        </span>
      </div>

      {/* Pickup Points List */}
      <div className="space-y-2">
        {nearestPoints.map((point) => {
          const isExpanded = expandedId === point.id;
          const isSelected = selectedPickupPoint === point.id;

          return (
            <div
              key={point.id}
              className={`rounded-lg border transition-all duration-200 ${
                isSelected
                  ? 'border-[#2E7D32]/40 bg-white'
                  : 'border-[#E6E7E8] bg-white/70 hover:border-[#2E7D32]/20'
              }`}
            >
              {/* Pickup point summary */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(point.id);
                }}
                className="flex w-full items-start gap-3 p-3 text-left"
              >
                {/* Map pin icon */}
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F7F8F8]">
                  <MapPin className="h-4 w-4 text-[#2E7D32]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#0F1111] truncate">
                      {point.name}
                    </span>
                    {point.isAvailable && (
                      <span className="flex items-center gap-1 shrink-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#2E7D32] animate-pulse" />
                        <span className="text-[10px] font-medium text-[#2E7D32]">
                          Disponible
                        </span>
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-[#565959] truncate">
                    {point.address}, {point.city}
                  </p>
                </div>

                {/* Expand/collapse */}
                <div className="mt-1 shrink-0">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-[#717171]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[#717171]" />
                  )}
                </div>
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="border-t border-[#E6E7E8] px-3 py-3">
                  <div className="space-y-2.5">
                    {/* Address */}
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#717171]" />
                      <div>
                        <p className="text-xs font-medium text-[#0F1111]">{point.address}</p>
                        <p className="text-[11px] text-[#565959]">{point.city}</p>
                      </div>
                    </div>

                    {/* Hours */}
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-[#717171]" />
                      <span className="text-xs text-[#565959]">{point.hours}</span>
                    </div>

                    {/* Availability badge */}
                    {point.isAvailable ? (
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#2E7D32]" />
                        <span className="text-xs font-semibold text-[#2E7D32]">
                          Disponible maintenant
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#BBB]" />
                        <span className="text-xs text-[#717171]">
                          Temporairement indisponible
                        </span>
                      </div>
                    )}

                    {/* Map placeholder */}
                    <div className="relative h-20 overflow-hidden rounded-lg bg-gradient-to-br from-[#E8F5E9] via-[#F1F8E9] to-[#FFF8E1]">
                      {/* Grid pattern to simulate map */}
                      <div className="absolute inset-0 opacity-20">
                        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                          <defs>
                            <pattern id="mapGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#2E7D32" strokeWidth="0.5" />
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#mapGrid)" />
                        </svg>
                      </div>
                      {/* Road lines */}
                      <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-[#D5D9D9]/40" />
                      <div className="absolute top-0 bottom-0 left-1/3 w-[2px] bg-[#D5D9D9]/40" />
                      <div className="absolute top-1/4 right-1/4 bottom-0 w-[1.5px] bg-[#D5D9D9]/30 rotate-12 origin-top" />
                      {/* Pin icon */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2E7D32] shadow-md">
                          <MapPin className="h-4 w-4 text-white" />
                        </div>
                        <div className="h-1.5 w-1.5 rounded-full bg-[#2E7D32]/40" />
                      </div>
                      {/* Label */}
                      <div className="absolute bottom-1.5 left-2 rounded bg-white/80 px-1.5 py-0.5 backdrop-blur-sm">
                        <span className="text-[9px] font-medium text-[#565959]">{point.city}</span>
                      </div>
                    </div>

                    {/* Choose button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPickup(point.id);
                      }}
                      disabled={!point.isAvailable}
                      className={`w-full rounded-lg py-2.5 text-xs font-semibold transition-all active:scale-[0.97] ${
                        isSelected
                          ? 'bg-[#2E7D32] text-white'
                          : point.isAvailable
                            ? 'border border-[#2E7D32] text-[#2E7D32] hover:bg-[#2E7D32]/5'
                            : 'cursor-not-allowed border border-[#D5D9D9] text-[#717171] bg-[#F7F8F8]'
                      }`}
                    >
                      {isSelected ? (
                        <span className="flex items-center justify-center gap-1.5">
                          <Check className="h-3.5 w-3.5" />
                          Point sélectionné
                        </span>
                      ) : point.isAvailable ? (
                        'Choisir ce point'
                      ) : (
                        'Indisponible'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Estimated pickup date */}
      <div className="mt-4 rounded-lg bg-white/80 p-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#FF8F00]" />
          <div>
            <p className="text-[11px] text-[#565959]">Obtenez-le pour</p>
            <p className="text-sm font-bold text-[#0F1111]">Demain — Retrait gratuit</p>
          </div>
        </div>
      </div>
    </button>
  );
}

// --------------------------------------------------------
// Home Delivery Card
// --------------------------------------------------------
function HomeDeliveryCard() {
  const { selectedCountry, selectedCity, selectedCurrency, deliveryType, setDeliveryType } = useProductStore();

  const isActive = deliveryType === 'domicile';
  const { zone, days, feeKey } = getDeliveryZoneInfo(
    selectedCountry.code,
    selectedCity,
    selectedCountry.capital
  );

  const fees = DELIVERY_FEES[selectedCountry.code] || DELIVERY_FEES.GN;
  const deliveryFee = fees[feeKey];

  // Calculate estimated delivery date
  const today = new Date();
  const minDays = zone === 'Capitale' ? 1 : 3;
  const maxDays = zone === 'Capitale' ? 2 : 5;
  const estimatedDate = new Date(today);
  estimatedDate.setDate(estimatedDate.getDate() + maxDays);
  const dateStr = estimatedDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  // Current step index (1-based, step 2 is current "En préparation")
  const currentStepIndex = 1;

  return (
    <button
      type="button"
      onClick={() => setDeliveryType('domicile')}
      className={`relative flex flex-col rounded-xl border-2 p-4 text-left transition-all duration-300 sm:p-5 ${
        isActive
          ? 'border-[#2E7D32] bg-[#E8F5E9]/60 shadow-sm'
          : 'border-[#D5D9D9] bg-white hover:border-[#2E7D32]/40 hover:shadow-sm'
      }`}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-[#2E7D32] px-2.5 py-0.5">
          <Check className="h-3 w-3 text-white" />
          <span className="text-[10px] font-medium text-white">Sélectionné</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
          isActive ? 'bg-[#2E7D32]' : 'bg-[#FF8F00]/10'
        }`}>
          <Truck className={`h-5 w-5 ${isActive ? 'text-white' : 'text-[#FF8F00]'}`} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#0F1111]">Livraison à Domicile</h4>
          <p className="text-xs text-[#565959]">{selectedCountry.flag} {selectedCountry.name}</p>
        </div>
      </div>

      {/* Progress Tracker */}
      <div className="mb-4">
        {/* Step labels (hidden on very small screens) */}
        <div className="mb-2 hidden sm:grid sm:grid-cols-4 gap-0">
          {DELIVERY_STEPS.map((step, idx) => {
            const StepIcon = step.icon;
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const isUpcoming = idx > currentStepIndex;

            return (
              <div key={step.id} className="flex flex-col items-center relative">
                {/* Connecting line (between steps) */}
                {idx < DELIVERY_STEPS.length - 1 && (
                  <div className="absolute top-3.5 left-[calc(50%+14px)] right-[calc(-50%+14px)] h-[3px] z-0">
                    <div
                      className={`h-full rounded-full transition-colors ${
                        idx < currentStepIndex ? 'bg-[#2E7D32]' : 'bg-[#E6E7E8]'
                      }`}
                    />
                  </div>
                )}

                {/* Step circle */}
                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ${
                      isCompleted
                        ? 'bg-[#2E7D32]'
                        : isCurrent
                          ? 'bg-[#FF8F00] ring-4 ring-[#FF8F00]/20'
                          : 'bg-[#E6E7E8]'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-3.5 w-3.5 text-white" />
                    ) : isCurrent ? (
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                      </span>
                    ) : (
                      <StepIcon className="h-3 w-3 text-[#BBB]" />
                    )}
                  </div>
                  <span
                    className={`mt-1.5 text-center text-[10px] leading-tight font-medium max-w-[70px] ${
                      isCompleted
                        ? 'text-[#2E7D32]'
                        : isCurrent
                          ? 'text-[#FF8F00] font-bold'
                          : 'text-[#BBB]'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile progress bar */}
        <div className="sm:hidden">
          <div className="flex items-center justify-between gap-1 mb-1.5">
            {DELIVERY_STEPS.map((step, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  <div
                    className={`h-2 w-full rounded-full transition-colors ${
                      isCompleted ? 'bg-[#2E7D32]' : isCurrent ? 'bg-[#FF8F00]' : 'bg-[#E6E7E8]'
                    }`}
                  />
                </div>
              );
            })}
          </div>
          {/* Step labels for mobile */}
          <div className="flex justify-between">
            {DELIVERY_STEPS.map((step, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step.id} className="flex items-center gap-0.5">
                  {isCompleted ? (
                    <Check className="h-2.5 w-2.5 text-[#2E7D32]" />
                  ) : isCurrent ? (
                    <CircleDot className="h-2.5 w-2.5 text-[#FF8F00]" />
                  ) : (
                    <div className="h-2 w-2 rounded-full border border-[#BBB]" />
                  )}
                  <span
                    className={`text-[8px] font-medium ${
                      isCompleted ? 'text-[#2E7D32]' : isCurrent ? 'text-[#FF8F00]' : 'text-[#BBB]'
                    }`}
                  >
                    {step.label.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Estimated delivery date */}
      <div className="mb-4 rounded-lg bg-white/80 p-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#FF8F00]" />
          <div>
            <p className="text-[11px] text-[#565959]">Obtenez-le pour</p>
            <p className="text-sm font-bold text-[#0F1111] capitalize">{dateStr}</p>
          </div>
        </div>
      </div>

      {/* Delivery zones */}
      <div className="mb-4 space-y-2">
        <p className="text-[11px] font-semibold text-[#565959] uppercase tracking-wide">
          Zones de livraison — {selectedCountry.name}
        </p>
        <div className="space-y-1.5">
          <div className={`flex items-center justify-between rounded-lg px-3 py-2 transition-colors ${
            zone === 'Capitale' ? 'bg-[#2E7D32]/10 border border-[#2E7D32]/20' : 'bg-[#F7F8F8]'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${zone === 'Capitale' ? 'bg-[#2E7D32]' : 'bg-[#717171]'}`} />
              <span className="inline-flex items-center gap-1.5 text-xs text-[#0F1111]">
                <Building2 className="h-3.5 w-3.5 text-[#565959]" /> {selectedCountry.capital}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#565959]">1-2 jours</span>
              <span className="text-xs font-semibold text-[#0F1111]">
                {formatPrice(fees.capital, selectedCurrency)}
              </span>
            </div>
          </div>
          <div className={`flex items-center justify-between rounded-lg px-3 py-2 transition-colors ${
            zone === 'Autres villes' ? 'bg-[#2E7D32]/10 border border-[#2E7D32]/20' : 'bg-[#F7F8F8]'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${zone === 'Autres villes' ? 'bg-[#2E7D32]' : 'bg-[#717171]'}`} />
              <span className="inline-flex items-center gap-1.5 text-xs text-[#0F1111]">
                <Home className="h-3.5 w-3.5 text-[#565959]" /> Autres villes
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#565959]">3-5 jours</span>
              <span className="text-xs font-semibold text-[#0F1111]">
                {formatPrice(fees.otherCities, selectedCurrency)}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-[#F7F8F8] px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#717171]" />
              <span className="inline-flex items-center gap-1.5 text-xs text-[#0F1111]">
                <Trees className="h-3.5 w-3.5 text-[#565959]" /> Zones rurales
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#565959]">5-7 jours</span>
              <span className="text-xs font-semibold text-[#0F1111]">
                {formatPrice(fees.rural, selectedCurrency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Current delivery zone indicator */}
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#FF8F00]/30 bg-[#FFF8E1] px-3 py-2.5">
        <MapPin className="h-4 w-4 shrink-0 text-[#FF8F00]" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[#0F1111]">
            {selectedCity} — {zone}
          </p>
          <p className="text-[11px] text-[#565959]">
            Livraison estimée : {days} •{' '}
            <span className="font-semibold text-[#FF8F00]">{formatPrice(deliveryFee, selectedCurrency)}</span>
          </p>
        </div>
      </div>

      {/* Cash on delivery badge */}
      <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#2E7D32]/5 to-[#FF8F00]/5 border border-[#2E7D32]/20 p-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2E7D32]/10">
          <Banknote className="h-[18px] w-[18px] text-[#2E7D32]" />
        </div>
        <div>
          <p className="text-xs font-bold text-[#2E7D32]">Payez à la livraison</p>
          <p className="text-[10px] text-[#565959]">
            Paiement en espèces à la réception
          </p>
        </div>
      </div>
    </button>
  );
}

// --------------------------------------------------------
// Main DeliveryTracker Component
// --------------------------------------------------------
export function DeliveryTracker() {
  const { deliveryType, selectedCountry } = useProductStore();

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF8F00]/10">
          <Truck className="h-[18px] w-[18px] text-[#FF8F00]" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-[#0F1111]">Options de Livraison</h3>
          <p className="text-xs text-[#565959]">
            {selectedCountry.flag} Livraison en {selectedCountry.name}
          </p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PickupPointCard />
        <HomeDeliveryCard />
      </div>

      {/* Delivery type summary */}
      <div className="rounded-xl border border-[#E6E7E8] bg-[#F7F8F8] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2E7D32]">
              {deliveryType === 'pickup' ? (
                <Store className="h-5 w-5 text-white" />
              ) : (
                <Truck className="h-5 w-5 text-white" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-[#0F1111]">
                {deliveryType === 'pickup'
                  ? 'Point de Retrait'
                  : 'Livraison à Domicile'}
              </p>
              <p className="text-xs text-[#565959]">
                {deliveryType === 'pickup'
                  ? 'Retrait gratuit dès demain'
                  : 'Livraison express à votre porte'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#565959]">Frais de livraison</p>
            <p className={`text-lg font-bold ${
              deliveryType === 'pickup' ? 'text-[#2E7D32]' : 'text-[#FF8F00]'
            }`}>
              {deliveryType === 'pickup' ? 'GRATUIT' : 'Variable'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeliveryTracker;
