'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { product } from '@/data/product';
import { useProductStore } from '@/store/product-store';
import { X, ChevronLeft, ChevronRight, Play, ZoomIn } from 'lucide-react';

// ============================================================
// Image Magnifier — Vanilla JS style with React refs
// ============================================================

function ImageMagnifier({ src, alt }: { src: string; alt: string }) {
  const mainImgRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const [isZooming, setIsZooming] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!mainImgRef.current || !zoomRef.current) return;
      const rect = mainImgRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      if (zoomRef.current) {
        zoomRef.current.style.backgroundPosition = `${x}% ${y}%`;
        const zoomWidth = 350;
        let left = e.clientX - rect.left + 20;
        if (left + zoomWidth > rect.width) {
          left = e.clientX - rect.left - zoomWidth - 20;
        }
        zoomRef.current.style.left = `${left}px`;
      }
    },
    []
  );

  return (
    <div className="relative w-full">
      <div
        ref={mainImgRef}
        className="relative aspect-square w-full cursor-crosshair overflow-hidden rounded-lg border border-[#DDD] bg-white"
        onMouseEnter={() => setIsZooming(true)}
        onMouseLeave={() => setIsZooming(false)}
        onMouseMove={handleMouseMove}
        onClick={() => useProductStore.getState().openLightbox()}
      >
        <Image
          src={src} alt={alt} fill
          className="object-contain p-4 transition-opacity duration-200"
          sizes="(max-width: 768px) 100vw, 45vw"
          priority
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded bg-black/50 px-2 py-1 text-xs text-white">
          <ZoomIn className="h-3 w-3" />
          Cliquez pour agrandir
        </div>
      </div>

      {/* Zoom desktop */}
      {isZooming && (
        <div
          ref={zoomRef}
          className="pointer-events-none absolute top-0 z-50 hidden h-[500px] w-[350px] overflow-hidden rounded-lg border-2 border-[#DDD] bg-white shadow-xl md:block"
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: '800px 800px',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="absolute bottom-2 right-2 rounded bg-black/50 px-2 py-1 text-xs text-white">2×</div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Lightbox
// ============================================================

function Lightbox() {
  const { showLightbox, closeLightbox, lightboxIndex, setLightboxIndex } = useProductStore();

  useEffect(() => {
    document.body.style.overflow = showLightbox ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showLightbox]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!showLightbox) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') setLightboxIndex((lightboxIndex + 1) % product.images.length);
      if (e.key === 'ArrowLeft') setLightboxIndex((lightboxIndex - 1 + product.images.length) % product.images.length);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showLightbox, lightboxIndex, closeLightbox, setLightboxIndex]);

  if (!showLightbox) return null;
  const currentImage = product.images[lightboxIndex];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90">
      <button onClick={closeLightbox} className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition hover:bg-white/20">
        <X className="h-6 w-6" />
      </button>
      <div className="absolute left-4 top-4 text-sm text-white/70">{lightboxIndex + 1} / {product.images.length}</div>
      <button onClick={() => setLightboxIndex((lightboxIndex - 1 + product.images.length) % product.images.length)} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition hover:bg-white/20">
        <ChevronLeft className="h-6 w-6" />
      </button>
      <div className="relative h-[80vh] w-[80vw]">
        <Image src={currentImage.src} alt={currentImage.alt} fill className="object-contain" sizes="80vw" />
      </div>
      <button onClick={() => setLightboxIndex((lightboxIndex + 1) % product.images.length)} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition hover:bg-white/20">
        <ChevronRight className="h-6 w-6" />
      </button>
      <div className="absolute bottom-6 text-sm text-white/70">{currentImage.alt}</div>
    </div>
  );
}

// ============================================================
// Image Gallery
// ============================================================

export default function ImageGallery() {
  const { selectedImageIndex, setSelectedImageIndex } = useProductStore();
  const currentImage = product.images[selectedImageIndex];

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-x-visible sm:overflow-y-auto sm:max-h-[500px] sm:w-[60px] sm:shrink-0">
        {product.images.map((img, index) => (
          <button
            key={img.id}
            onClick={() => setSelectedImageIndex(index)}
            className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-md border-2 transition-all duration-200 sm:h-[56px] sm:w-[56px] ${
              index === selectedImageIndex
                ? 'border-[#E65100] shadow-[0_0_0_1px_#E65100]'
                : 'border-[#DDD] hover:border-[#999]'
            }`}
          >
            <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="60px" />
            {img.isVideo && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Play className="h-5 w-5 text-white" fill="white" />
              </div>
            )}
          </button>
        ))}
      </div>
      <div className="flex-1 min-w-0">
        <ImageMagnifier src={currentImage.src} alt={currentImage.alt} />
      </div>
      <Lightbox />
    </div>
  );
}
