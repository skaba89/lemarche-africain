'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRecentlyViewedStore } from '@/store/recently-viewed-store';
import ProductCard from '@/components/product/ProductCard';
import { toast } from 'sonner';

interface ProductData {
  id: string;
  slug: string;
  name: string;
  brand: string;
  priceGNF: number;
  originalPriceGNF?: number | null;
  rating: number;
  ratingCount: number;
  images: string;
  isOfficial: boolean;
  stock: number;
  category?: { slug: string; name: string };
}

export default function RecentlyViewed() {
  const { recentlyViewed, clearHistory } = useRecentlyViewedStore();
  const [products, setProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Only show slugs that are not the current product (exclude if needed)
  const displaySlugs = recentlyViewed.slice(0, 10);

  // Fetch product data for slugs
  useEffect(() => {
    if (displaySlugs.length < 2) {
      setProducts([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    async function fetchProducts() {
      try {
        const results = await Promise.allSettled(
          displaySlugs.map((slug) =>
            fetch(`/api/products/${slug}`).then((res) => {
              if (!res.ok) throw new Error('Not found');
              return res.json();
            })
          )
        );

        if (cancelled) return;

        const fetched: ProductData[] = [];
        results.forEach((result) => {
          if (result.status === 'fulfilled' && result.value?.product) {
            fetched.push(result.value.product);
          }
        });

        setProducts(fetched);
      } catch {
        // Silently fail
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, [displaySlugs]);

  // Check scrollability
  const updateScrollButtons = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
  }, []);

  useEffect(() => {
    updateScrollButtons();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', updateScrollButtons, { passive: true });
      window.addEventListener('resize', updateScrollButtons);
    }
    return () => {
      if (el) el.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [updateScrollButtons, products]);

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const handleClear = () => {
    clearHistory();
    setProducts([]);
    toast.success('Historique effac\u00e9');
  };

  // Don't render if fewer than 2 items in history
  if (displaySlugs.length < 2) return null;

  // Don't render if all fetches failed
  if (!isLoading && products.length === 0) return null;

  return (
    <section className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium text-[#0F1111] dark:text-gray-100 flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#1B5E20]" />
          R&eacute;cemment consult&eacute;s
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="text-xs text-gray-500 hover:text-[#CC0C39] h-8 px-2"
        >
          <X className="h-3 w-3 mr-1" />
          Effacer
        </Button>
      </div>

      {/* Scrollable row */}
      <div className="relative group">
        {/* Left arrow */}
        {canScrollLeft && (
          <button
            onClick={handleScrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="D\u00e9filer vers la gauche"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-200" />
          </button>
        )}

        {/* Product cards */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {isLoading ? (
            <div className="flex gap-4">
              {Array.from({ length: Math.min(displaySlugs.length, 6) }).map((_, i) => (
                <div
                  key={i}
                  className="shrink-0 w-[180px] animate-pulse"
                >
                  <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            products.map((product) => (
              <div key={product.id} className="shrink-0 w-[180px]">
                <ProductCard product={product} />
              </div>
            ))
          )}
        </div>

        {/* Right arrow */}
        {canScrollRight && (
          <button
            onClick={handleScrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="D\u00e9filer vers la droite"
          >
            <ChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-200" />
          </button>
        )}
      </div>
    </section>
  );
}
