'use client';

import { useState } from 'react';
import { MessageCircle, X, Phone, ShoppingBag } from 'lucide-react';
import { BUSINESS } from '@/lib/constants';

// ============================================================
// Floating WhatsApp Button — Always visible on mobile
// ============================================================

export function FloatingWhatsApp() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-40 md:bottom-6 md:right-6">
      {/* Expanded menu */}
      {expanded && (
        <div className="mb-3 flex flex-col gap-2 animate-[slideUp_0.3s_ease-out]">
          <a
            href={`https://wa.me/${BUSINESS.whatsapp}?text=Bonjour, je suis intéressé par un produit`}
            target="_blank"
            rel="noopener"
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm text-[#0F1111] shadow-lg border border-[#DDD] hover:bg-[#F7F8F8] transition"
          >
            <MessageCircle className="h-4 w-4 text-[#25D366]" />
            <span>Commander sur WhatsApp</span>
          </a>
          <a
            href={`https://wa.me/${BUSINESS.whatsapp}?text=Bonjour, j'ai une question sur un produit`}
            target="_blank"
            rel="noopener"
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm text-[#0F1111] shadow-lg border border-[#DDD] hover:bg-[#F7F8F8] transition"
          >
            <Phone className="h-4 w-4 text-[#2196F3]" />
            <span>Parler au support</span>
          </a>
          <a
            href={`https://wa.me/${BUSINESS.whatsapp}?text=Bonjour, je voudrais suivre ma commande`}
            target="_blank"
            rel="noopener"
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm text-[#0F1111] shadow-lg border border-[#DDD] hover:bg-[#F7F8F8] transition"
          >
            <ShoppingBag className="h-4 w-4 text-[#FF6600]" />
            <span>Suivi de commande</span>
          </a>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all hover:bg-[#128C7E] active:scale-95"
        aria-label="WhatsApp"
      >
        {expanded ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-7 w-7" fill="white" />
        )}
      </button>

      {/* Notification dot */}
      {!expanded && (
        <span className="absolute top-0 right-0 flex h-4 w-4">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-75" />
          <span className="relative inline-flex h-4 w-4 rounded-full bg-[#25D366] items-center justify-center text-[8px] text-white font-bold">1</span>
        </span>
      )}
    </div>
  );
}
