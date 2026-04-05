'use client';

import { useState, useEffect, useCallback } from 'react';
import { Truck, Tag, ShieldCheck, Headphones } from 'lucide-react';

// ============================================================
// Promotional slides data
// ============================================================

const SLIDES = [
  {
    title: 'Livraison Gratuite',
    description: 'Sur toutes les commandes de plus de 5M GNF',
    from: '#1B5E20',
    to: '#2E7D32',
    Icon: Truck,
  },
  {
    title: '-50% sur votre 1ère commande',
    description: 'Utilisez le code AFRI50',
    from: '#FF8F00',
    to: '#F57C00',
    Icon: Tag,
  },
  {
    title: 'Paiement Mobile Sécurisé',
    description: 'Orange Money, MTN MoMo, Wave',
    from: '#0D47A1',
    to: '#1565C0',
    Icon: ShieldCheck,
  },
  {
    title: 'Service Client 24/7',
    description: 'Toujours là pour vous aider via WhatsApp',
    from: '#4A148C',
    to: '#7B1FA2',
    Icon: Headphones,
  },
];

// ============================================================
// PromoCarousel Component
// ============================================================

export default function PromoCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  // Auto-advance every 5 seconds, pause on hover
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const goToSlide = (index: number) => {
    setCurrent(index);
  };

  const slide = SLIDES[current];
  const { Icon } = slide;

  return (
    <div
      className="relative rounded-2xl overflow-hidden shadow-md h-[140px] md:h-[180px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Promotions en vedette"
    >
      {/* Slides container */}
      <div className="relative w-full h-full">
        {SLIDES.map((s, index) => {
          const SlideIcon = s.Icon;
          const isActive = index === current;
          const direction = index > current || (current === SLIDES.length - 1 && index === 0)
            ? 'translate-x-full'
            : '-translate-x-full';

          return (
            <div
              key={index}
              className="absolute inset-0 flex items-center px-6 md:px-10 transition-all duration-700 ease-in-out"
              style={{
                background: `linear-gradient(135deg, ${s.from}, ${s.to})`,
                opacity: isActive ? 1 : 0,
                transform: isActive ? 'translateX(0)' : direction,
                pointerEvents: isActive ? 'auto' : 'none',
              }}
              aria-hidden={!isActive}
            >
              {/* Text content */}
              <div className="flex-1 z-10">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                  {s.title}
                </h3>
                <p className="text-sm md:text-base text-white/80 max-w-md">
                  {s.description}
                </p>
              </div>

              {/* Background icon (decorative) */}
              <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-20 h-20 opacity-20 hidden md:block">
                <SlideIcon className="w-full h-full text-white" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`rounded-full transition-all duration-300 ${
              index === current
                ? 'w-6 h-2 bg-white'
                : 'w-2 h-2 bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Aller à la promotion ${index + 1}`}
            aria-current={index === current ? 'true' : undefined}
          />
        ))}
      </div>
    </div>
  );
}
