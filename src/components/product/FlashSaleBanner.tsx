'use client';

import { useState, useEffect, useRef } from 'react';
import { Flame, Eye, TrendingUp, Clock } from 'lucide-react';

// ============================================================
// FlashSaleBanner — Urgency-driven conversion banner
// "Le Marché Africain"
// ============================================================

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomDuration(): number {
  // 4 to 8 hours in seconds
  return randomBetween(4 * 3600, 8 * 3600);
}

function formatTime(totalSeconds: number): { hours: string; minutes: string; seconds: string } {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return {
    hours: h.toString().padStart(2, '0'),
    minutes: m.toString().padStart(2, '0'),
    seconds: s.toString().padStart(2, '0'),
  };
}

export function FlashSaleBanner() {
  // ---- Use mounted state to avoid hydration mismatch ----
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(5 * 3600); // default 5h
  const [viewerCount, setViewerCount] = useState<number>(47);
  const [stockClaimed, setStockClaimed] = useState<number>(72);
  const [itemsLeft, setItemsLeft] = useState<number>(8);
  const prevStockRef = useRef<number>(72);

  // ---- Initialize random values on client only ----
  useEffect(() => {
    setMounted(true);
    setTimeLeft(generateRandomDuration());
    setViewerCount(randomBetween(38, 56));
    setItemsLeft(randomBetween(5, 14));
  }, []);

  // ---- Countdown: tick every 1s ----
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return generateRandomDuration();
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [mounted]);

  // ---- Viewer count: fluctuate every 10s ----
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      setViewerCount((prev) => {
        const delta = randomBetween(-3, 3);
        const next = Math.max(18, Math.min(72, prev + delta));
        return next;
      });
    }, 10_000);
    return () => clearInterval(interval);
  }, [mounted]);

  // ---- Stock claimed: slowly increase over time ----
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      setStockClaimed((prev) => {
        if (prev >= 95) return 95;
        const increase = randomBetween(1, 3);
        return Math.min(95, prev + increase);
      });
    }, 30_000);
    return () => clearInterval(interval);
  }, [mounted]);

  // ---- Sync itemsLeft to decrease as stockClaimed increases ----
  useEffect(() => {
    if (!mounted) return;
    const prevStock = prevStockRef.current;
    if (stockClaimed > prevStock) {
      const decrease = stockClaimed - prevStock;
      setItemsLeft((prev) => Math.max(1, prev - Math.ceil(decrease / 5)));
    }
    prevStockRef.current = stockClaimed;
  }, [stockClaimed, mounted]);

  const time = formatTime(timeLeft);

  if (!mounted) {
    // Return skeleton during SSR to avoid hydration mismatch
    return (
      <div className="relative w-full overflow-hidden rounded-lg">
        <div className="relative bg-gradient-to-r from-[#B71C1C] via-[#C62828] to-[#880E4F] px-4 py-4 sm:px-6 sm:py-5">
          <div className="relative z-10 flex items-center gap-2">
            <Flame className="h-5 w-5 text-[#FFD814] animate-pulse" />
            <span className="text-xs font-extrabold tracking-wider text-[#FFD814] sm:text-sm">
              VENTE FLASH
            </span>
            <span className="rounded-full border border-[#FFD814]/40 bg-[#FFD814]/10 px-2.5 py-1 text-xs font-bold text-[#FFD814]">
              -35%
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-lg">
      {/* Gradient background with shimmer overlay */}
      <div className="relative bg-gradient-to-r from-[#B71C1C] via-[#C62828] to-[#880E4F] px-4 py-4 sm:px-6 sm:py-5">
        {/* Shimmer effect */}
        <div
          className="pointer-events-none absolute inset-0 animate-shimmer"
          style={{
            background:
              'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%)',
            backgroundSize: '200% 100%',
          }}
        />

        <div className="relative z-10 flex flex-col gap-4">
          {/* ---- Row 1: Badge + Discount + Fire ---- */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* VENTE FLASH pulsing badge */}
              <span className="animate-pulse-slow inline-flex items-center gap-1.5 rounded-md bg-[#FFD814] px-2.5 py-1 sm:px-3 sm:py-1.5 shadow-lg shadow-black/20">
                <Flame className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#B71C1C]" />
                <span className="text-xs font-extrabold tracking-wider text-[#B71C1C] sm:text-sm">
                  VENTE FLASH
                </span>
              </span>

              {/* Discount percentage */}
              <span className="rounded-full border border-[#FFD814]/40 bg-[#FFD814]/10 px-2.5 py-1 text-xs font-bold text-[#FFD814] sm:text-sm">
                -35%
              </span>
            </div>

            {/* Fire emoji with subtle animation */}
            <span className="animate-float" aria-hidden="true">
              <Flame className="h-6 w-6 text-[#FFD814]" />
            </span>
          </div>

          {/* ---- Row 2: Countdown timer ---- */}
          <div className="flex flex-col items-center gap-1.5 sm:items-start">
            <div className="flex items-center gap-1.5 text-[#FFD814]/80">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-[11px] font-medium uppercase tracking-wider sm:text-xs">
                Se termine dans
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Hours */}
              <TimeDigit value={time.hours} label="Heures" />
              <SeparatorColon />
              {/* Minutes */}
              <TimeDigit value={time.minutes} label="Minutes" />
              <SeparatorColon />
              {/* Seconds */}
              <TimeDigit value={time.seconds} label="Secondes" />
            </div>
          </div>

          {/* ---- Row 3: Stock progress bar ---- */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-[#FFD814]" />
                <span className="text-[11px] font-semibold text-white/90 sm:text-xs">
                  {stockClaimed}% des articles vendus
                </span>
              </div>
              <span className="text-[11px] font-bold text-[#FFD814] sm:text-xs">
                Vite ! Plus que {itemsLeft} articles
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/25 backdrop-blur-sm">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${stockClaimed}%`,
                  background: 'linear-gradient(90deg, #FFD814, #FFAB00, #FF8F00)',
                }}
              />
            </div>
          </div>

          {/* ---- Row 4: Viewer count ---- */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            <Eye className="h-3.5 w-3.5 text-white/70" />
            <span className="text-[11px] text-white/70 sm:text-xs">
              <span className="font-bold text-white">{viewerCount}</span>{' '}
              personnes regardent ce produit
            </span>
            {/* Live dot indicator */}
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function TimeDigit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-md bg-black/30 backdrop-blur-sm sm:h-14 sm:w-14">
        <span
          className="text-xl font-extrabold text-white tabular-nums tracking-tight sm:text-2xl"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {value}
        </span>
      </div>
      <span className="mt-0.5 text-[9px] font-medium uppercase tracking-wider text-white/50 sm:text-[10px]">
        {label}
      </span>
    </div>
  );
}

function SeparatorColon() {
  return (
    <span
      className="flex h-11 items-center text-xl font-bold text-[#FFD814] tabular-nums sm:h-14 sm:text-2xl"
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      :
    </span>
  );
}
