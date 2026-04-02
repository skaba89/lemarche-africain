'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { Star, Heart, ShoppingCart, Truck, ShieldCheck, ArrowUpDown, Eye } from 'lucide-react';
import { useProductStore, formatPrice } from '@/store/product-store';
import { useCartStore } from '@/store/cart-store';
import { useComparisonStore } from '@/store/comparison-store';
import { useQuickViewStore } from '@/store/quick-view-store';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ProductCardProps {
  product: {
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
    salesCount?: number;
    createdAt?: string;
    specifications?: string;
    features?: string;
    category?: { slug: string; name: string };
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const selectedCurrency = useProductStore((s) => s.selectedCurrency);
  const comparisonStore = useComparisonStore();
  const isInComparison = comparisonStore.isInComparison(product.id);
  const [isWishlisted, setIsWishlisted] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const stored: string[] = JSON.parse(localStorage.getItem('le-marche-wishlist') || '[]');
      return Array.isArray(stored) && stored.includes(product.slug);
    } catch {
      return false;
    }
  });
  const images: string[] = useMemo(() => {
    try { return JSON.parse(product.images); } catch { return []; }
  }, [product.images]);
  const mainImage = images[0] || '/product-images/headphones-main.png';
  const discount = product.originalPriceGNF
    ? Math.round(((product.originalPriceGNF - product.priceGNF) / product.originalPriceGNF) * 100)
    : null;

  // Dynamic badge logic
  const isNew = product.createdAt
    ? (Date.now() - new Date(product.createdAt).getTime()) < 30 * 24 * 60 * 60 * 1000
    : false;
  const isPopular = (product.salesCount ?? 0) > 50;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  // Badge priority: max 3 visible. Priority: discount > official > new > lowStock > popular
  const topLeftBadges: { label: string; className: string }[] = [];
  const topRightBadges: { label: string; className: string }[] = [];
  const bottomLeftBadges: { label: string; className: string }[] = [];
  let badgeCount = 0;
  const maxBadges = 3;

  if (discount && discount > 0 && badgeCount < maxBadges) {
    topLeftBadges.push({ label: `-${discount}%`, className: 'bg-[#B12704] text-white border-0 text-[10px] font-bold' });
    badgeCount++;
  }
  if (!isNew || badgeCount >= maxBadges) {
    // pass
  } else if (isNew && badgeCount < maxBadges) {
    topLeftBadges.push({ label: 'Nouveau', className: 'bg-blue-500 text-white border-0 text-[9px] font-medium' });
    badgeCount++;
  }
  if (product.isOfficial && badgeCount < maxBadges) {
    topRightBadges.push({ label: 'OFFICIEL', className: 'bg-[#1B5E20] text-white border-0 text-[9px]' });
    badgeCount++;
  }
  if (isLowStock && badgeCount < maxBadges) {
    bottomLeftBadges.push({ label: 'Stock limit\u00e9', className: 'bg-red-500 text-white border-0 text-[9px] animate-pulse' });
    badgeCount++;
  } else if (isPopular && badgeCount < maxBadges) {
    bottomLeftBadges.push({ label: 'Populaire', className: 'bg-amber-500 text-white border-0 text-[9px] font-medium' });
    badgeCount++;
  }

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const stored: string[] = JSON.parse(localStorage.getItem('le-marche-wishlist') || '[]');
      let updated: string[];
      if (stored.includes(product.slug)) {
        updated = stored.filter((s) => s !== product.slug);
        setIsWishlisted(false);
        toast.success('Retir\u00e9 des favoris');
      } else {
        updated = [...stored, product.slug];
        setIsWishlisted(true);
        toast.success('Ajout\u00e9 aux favoris');
      }
      localStorage.setItem('le-marche-wishlist', JSON.stringify(updated));
    } catch {
      toast.error('Erreur lors de la mise \u00e0 jour des favoris');
    }
  };

  const addToCartQuick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    useCartStore.getState().addItem({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      image: mainImage,
      color: 'default',
      colorLabel: 'Standard',
      size: 'default',
      sizeLabel: 'Standard',
      priceGNF: product.priceGNF,
      originalPriceGNF: product.originalPriceGNF || product.priceGNF,
      quantity: 1,
      stock: product.stock,
    });
    toast.success(`${product.name} ajout\u00e9 au panier`);
  };

  const toggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInComparison) {
      comparisonStore.removeProduct(product.id);
      toast.success('Retir\u00e9 de la comparaison');
    } else {
      if (comparisonStore.products.length >= 4) {
        toast.error('Maximum 4 produits pour la comparaison');
        return;
      }
      comparisonStore.addProduct({
        id: product.id,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        priceGNF: product.priceGNF,
        originalPriceGNF: product.originalPriceGNF || null,
        rating: product.rating,
        ratingCount: product.ratingCount,
        images: product.images,
        specifications: product.specifications || '[]',
        features: product.features || '[]',
        stock: product.stock,
        category: product.category || { slug: '', name: '' },
      });
      toast.success('Ajout\u00e9 \u00e0 la comparaison');
    }
  };

  const openQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    useQuickViewStore.getState().open(product.slug);
  };

  return (
    <Link
      href={`/produit/${product.slug}`}
      className="group h-full block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image container */}
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
        <img
          src={mainImage}
          alt={`Image de ${product.name}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Top-left badges (discount, nouveau) */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {topLeftBadges.map((badge, i) => (
            <Badge key={`tl-${i}`} className={badge.className}>
              {badge.label}
            </Badge>
          ))}
        </div>
        {/* Top-right badges (official) */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {topRightBadges.map((badge, i) => (
            <Badge key={`tr-${i}`} className={badge.className}>
              {badge.label}
            </Badge>
          ))}
        </div>
        {/* Bottom-left badges (stock limité, populaire) */}
        <div className="absolute bottom-10 left-2 flex flex-col gap-1">
          {bottomLeftBadges.map((badge, i) => (
            <Badge key={`bl-${i}`} className={badge.className}>
              {badge.label}
            </Badge>
          ))}
        </div>
        {/* Action buttons overlay */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
          {/* Quick add to cart (left) */}
          <button
            onClick={addToCartQuick}
            aria-label="Ajouter au panier"
            className="w-8 h-8 rounded-full bg-[#1B5E20]/90 shadow-sm flex items-center justify-center hover:bg-[#1B5E20] transition-colors active:scale-95"
          >
            <ShoppingCart className="h-4 w-4 text-white" />
          </button>

          {/* Quick view (center) */}
          <button
            onClick={openQuickView}
            aria-label="Aper\u00e7u rapide"
            className="bg-black/60 text-white backdrop-blur-sm rounded-full px-2.5 py-1.5 flex items-center gap-1 text-[10px] font-medium hover:bg-black/70 transition-colors active:scale-95"
          >
            <Eye className="h-3.5 w-3.5" /> Aper&ccedil;u
          </button>

          {/* Compare button (center-right) */}
          <button
            onClick={toggleCompare}
            aria-label={isInComparison ? 'Retirer de la comparaison' : 'Ajouter \u00e0 la comparaison'}
            className={`w-8 h-8 rounded-full shadow-sm flex items-center justify-center transition-colors active:scale-95 ${
              isInComparison
                ? 'bg-[#1B5E20]/90 text-white'
                : 'bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700'
            }`}
          >
            <ArrowUpDown className={`h-4 w-4 ${isInComparison ? 'text-white' : 'text-gray-600'}`} />
          </button>

          {/* Heart button (right) */}
          <button
            onClick={toggleWishlist}
            aria-label={isWishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            className="w-8 h-8 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-sm flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition-colors active:scale-95"
          >
            <Heart className={`h-4 w-4 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-[#CC0C39]'}`} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 dark:bg-gray-800">
        {/* Brand */}
        <p className="text-[10px] text-[#444] dark:text-gray-400 font-medium uppercase tracking-wider mb-0.5">{product.brand}</p>
        {/* Title */}
        <h3 className="text-xs text-gray-900 dark:text-gray-100 line-clamp-2 mb-1.5 min-h-[2rem] leading-4 font-medium">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-1.5">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i <= Math.floor(product.rating)
                    ? 'text-[#FF8F00] fill-[#FF8F00]'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] text-gray-500 dark:text-gray-400">({product.ratingCount.toLocaleString()})</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-bold text-[#B12704]">
            {formatPrice(product.priceGNF, selectedCurrency)}
          </span>
        </div>
        {product.originalPriceGNF && (
          <span className="text-[10px] text-gray-400 line-through">
            {formatPrice(product.originalPriceGNF, selectedCurrency)}
          </span>
        )}

        {/* Delivery info */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] text-[#2E7D32] flex items-center gap-0.5">
            <Truck className="h-3 w-3" /> Livraison disponible
          </span>
          {product.isOfficial && (
            <span className="text-[10px] text-[#1B5E20] flex items-center gap-0.5">
              <ShieldCheck className="h-3 w-3" /> Officiel
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
