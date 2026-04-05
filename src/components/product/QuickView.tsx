'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  X,
  Star,
  ShoppingCart,
  Heart,
  Truck,
  Shield,
  RotateCcw,
  Check,
  AlertTriangle,
  Plus,
  Minus,
  Loader2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useProductStore, formatPrice } from '@/store/product-store';
import { useCartStore } from '@/store/cart-store';

// ============================================================
// Types
// ============================================================

interface ProductImage {
  src: string;
  alt?: string;
}

interface ProductColor {
  id: string;
  label: string;
  hex: string;
}

interface ProductSize {
  id: string;
  label: string;
}

interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  priceGNF: number;
  originalPriceGNF: number | null;
  rating: number;
  ratingCount: number;
  stock: number;
  isOfficial: boolean;
  seller: string | null;
  sellerVerified: boolean;
  colors: string;
  sizes: string | null;
  images: string;
  category: { slug: string; name: string };
}

// ============================================================
// QuickView Component
// ============================================================

interface QuickViewProps {
  isOpen: boolean;
  onClose: () => void;
  productSlug: string;
}

export default function QuickView({ isOpen, onClose, productSlug }: QuickViewProps) {
  const router = useRouter();
  const { selectedCurrency } = useProductStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  // Parse product data
  const images: ProductImage[] = useMemo(() => {
    if (!product) return [];
    try {
      const p = JSON.parse(product.images);
      if (Array.isArray(p)) {
        return p.map((img: unknown) => {
          if (typeof img === 'string') return { src: img, alt: product.name };
          if (img && typeof img === 'object' && 'src' in img) return img as ProductImage;
          return { src: String(img), alt: product.name };
        });
      }
    } catch { /* ignore */ }
    return [];
  }, [product]);

  const colors: ProductColor[] = useMemo(() => {
    if (!product) return [];
    try { const c = JSON.parse(product.colors); return Array.isArray(c) ? c : []; } catch { return []; }
  }, [product]);

  const sizes: ProductSize[] = useMemo(() => {
    if (!product) return [];
    try { const s = JSON.parse(product.sizes || '[]'); return Array.isArray(s) ? s : []; } catch { return []; }
  }, [product]);

  const discount = product?.originalPriceGNF
    ? Math.round(((product.originalPriceGNF - product.priceGNF) / product.originalPriceGNF) * 100)
    : null;

  const mainImage = images[selectedImageIndex]?.src || images[0]?.src || '/product-images/headphones-main.png';

  // Fetch product when slug changes and modal is open
  useEffect(() => {
    if (!isOpen || !productSlug) return;

    let cancelled = false;
    async function fetchProduct() {
      setLoading(true);
      setFetchError(false);
      setProduct(null);
      setSelectedImageIndex(0);
      setQuantity(1);
      setSelectedColor('');
      setSelectedSize('');

      try {
        const res = await fetch(`/api/products/${productSlug}`);
        if (!res.ok) {
          if (!cancelled) setFetchError(true);
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setProduct(data.product);
          // Auto-select first color/size
          try {
            const c = JSON.parse(data.product.colors);
            if (Array.isArray(c) && c.length > 0) setSelectedColor(c[0].id);
          } catch { /* ignore */ }
          try {
            const s = JSON.parse(data.product.sizes || '[]');
            if (Array.isArray(s) && s.length > 0) setSelectedSize(s[0].id);
          } catch { /* ignore */ }
        }
      } catch {
        if (!cancelled) setFetchError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchProduct();
    return () => { cancelled = true; };
  }, [isOpen, productSlug]);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    const colorOption = colors.find((c) => c.id === selectedColor);
    const sizeOption = sizes.find((s) => s.id === selectedSize);

    useCartStore.getState().addItem({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      image: mainImage,
      color: selectedColor || 'default',
      colorLabel: colorOption?.label || 'Standard',
      size: selectedSize || 'default',
      sizeLabel: sizeOption?.label || 'Standard',
      priceGNF: product.priceGNF,
      originalPriceGNF: product.originalPriceGNF || product.priceGNF,
      quantity,
      stock: product.stock,
    });
    toast.success(`${product.name} ajout\u00e9 au panier`);
  }, [product, colors, sizes, selectedColor, selectedSize, mainImage, quantity]);

  const handleRetry = useCallback(() => {
    setFetchError(false);
    // Trigger re-fetch by toggling loading
    setLoading(true);
    async function retry() {
      try {
        const res = await fetch(`/api/products/${productSlug}`);
        if (!res.ok) { setFetchError(true); return; }
        const data = await res.json();
        setProduct(data.product);
      } catch { setFetchError(true); }
      finally { setLoading(false); }
    }
    retry();
  }, [productSlug]);

  const handleViewDetails = useCallback(() => {
    onClose();
    router.push(`/produit/${productSlug}`);
  }, [onClose, router, productSlug]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogTitle className="sr-only">Aper&ccedil;u rapide du produit</DialogTitle>
      <DialogDescription className="sr-only">Vue d&apos;ensemble rapide du produit avec options d&apos;achat</DialogDescription>
      <DialogContent
        className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto p-0 top-[50%] translate-y-[-50%]"
        showCloseButton={false}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-sm flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition-colors"
          aria-label="Fermer"
        >
          <X className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </button>

        {loading && (
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Skeleton left */}
              <div className="w-full md:w-[45%]">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <div className="flex gap-2 mt-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="w-16 h-16 rounded-lg" />
                  ))}
                </div>
              </div>
              {/* Skeleton right */}
              <div className="w-full md:w-[55%] space-y-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        )}

        {fetchError && !loading && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <AlertTriangle className="h-12 w-12 text-[#FF8F00] mb-4" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Erreur lors du chargement du produit</p>
            <Button onClick={handleRetry} variant="outline" className="border-[#1B5E20] text-[#1B5E20]">
              R&eacute;essayer
            </Button>
          </div>
        )}

        {product && !loading && !fetchError && (
          <div className="flex flex-col md:flex-row">
            {/* Left column - Image (45%) */}
            <div className="w-full md:w-[45%] p-6 pb-2 md:pb-6 md:pr-2">
              <div className="relative aspect-square w-full rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 overflow-hidden">
                <img
                  src={mainImage}
                  alt={product.name}
                  className="w-full h-full object-contain p-4"
                />
                {discount && discount > 0 && (
                  <Badge className="absolute top-2 left-2 bg-[#B12704] text-white border-0 text-xs font-bold">
                    -{discount}%
                  </Badge>
                )}
              </div>
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`shrink-0 w-14 h-14 rounded-lg border-2 overflow-hidden transition-all ${
                        selectedImageIndex === idx
                          ? 'border-[#1B5E20] shadow-sm'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <img src={img.src} alt={img.alt || product.name} className="w-full h-full object-contain p-1" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right column - Info (55%) */}
            <div className="w-full md:w-[55%] p-6 pt-2 md:pt-6 md:pl-2 flex flex-col gap-3">
              {/* Brand */}
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
                {product.brand}
              </p>

              {/* Product name */}
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-snug">
                {product.name}
              </h2>

              {/* Rating */}
              <Link
                href={`/produit/${product.slug}`}
                onClick={() => onClose()}
                className="inline-flex items-center gap-1.5 w-fit hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i <= Math.round(product.rating)
                          ? 'text-[#FF8F00] fill-[#FF8F00]'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-[#005A6E] dark:text-gray-300">
                  {product.rating} ({product.ratingCount.toLocaleString()} &eacute;valuations)
                </span>
              </Link>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-[#B12704]">
                  {formatPrice(product.priceGNF, selectedCurrency)}
                </span>
                {product.originalPriceGNF && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(product.originalPriceGNF, selectedCurrency)}
                  </span>
                )}
                {discount && discount > 0 && (
                  <Badge className="bg-[#B12704] text-white border-0 text-[10px]">
                    -{discount}%
                  </Badge>
                )}
              </div>

              {/* Color selector */}
              {colors.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Couleur : <span className="text-gray-500 dark:text-gray-400">{colors.find(c => c.id === selectedColor)?.label || ''}</span>
                  </p>
                  <div className="flex gap-2">
                    {colors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => setSelectedColor(color.id)}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${
                          selectedColor === color.id
                            ? 'border-[#1B5E20] ring-2 ring-[#1B5E20]/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size selector */}
              {sizes.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Taille</p>
                  <div className="flex flex-wrap gap-1.5">
                    {sizes.map((size) => (
                      <button
                        key={size.id}
                        onClick={() => setSelectedSize(size.id)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                          selectedSize === size.id
                            ? 'border-[#1B5E20] bg-[#E8F5E9] dark:bg-[#1B5E20]/20 text-[#1B5E20]'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity picker */}
              {product.stock > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Quantit&eacute; :</span>
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-10 h-8 flex items-center justify-center text-xs font-semibold border-x border-gray-300 dark:border-gray-600">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Stock status */}
              <div>
                {product.stock > 0 ? (
                  <span className="text-xs text-[#2E7D32] font-medium flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> En stock ({product.stock} disponibles)
                  </span>
                ) : (
                  <span className="text-xs text-[#CC0C39] font-medium flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> Rupture de stock
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mt-1">
                {product.stock > 0 && (
                  <Button
                    onClick={handleAddToCart}
                    className="flex-1 bg-[#FF8F00] hover:bg-[#E68100] text-white text-sm font-semibold rounded-lg h-10"
                  >
                    <ShoppingCart className="h-4 w-4 mr-1.5" />
                    Ajouter au panier
                  </Button>
                )}
                <Button
                  onClick={handleViewDetails}
                  variant="outline"
                  className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-semibold rounded-lg h-10"
                >
                  Voir les d&eacute;tails
                </Button>
              </div>

              {/* Seller info */}
              {product.seller && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1B5E20] text-white text-[10px] font-bold">
                    {product.seller.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{product.seller}</p>
                    {product.sellerVerified && (
                      <p className="text-[10px] text-[#2E7D32] flex items-center gap-0.5">
                        <Check className="h-3 w-3" /> Vendeur v&eacute;rifi&eacute;
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Trust badges */}
              <div className="flex flex-wrap gap-3 mt-1">
                <span className="flex items-center gap-1 text-[10px] text-gray-600 dark:text-gray-400">
                  <Truck className="h-3.5 w-3.5 text-[#2E7D32]" />
                  Livraison rapide
                </span>
                <span className="flex items-center gap-1 text-[10px] text-gray-600 dark:text-gray-400">
                  <RotateCcw className="h-3.5 w-3.5 text-[#1565C0]" />
                  Retour 14j
                </span>
                <span className="flex items-center gap-1 text-[10px] text-gray-600 dark:text-gray-400">
                  <Shield className="h-3.5 w-3.5 text-[#1B5E20]" />
                  100% Authentique
                </span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
