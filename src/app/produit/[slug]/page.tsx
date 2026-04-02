'use client';

import { useState, useEffect, use, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  Star,
  Heart,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  Check,
  Clock,
  Share2,
  Minus,
  Plus,
  AlertTriangle,
  ChevronLeft,
  X,
  ArrowUp,
  Loader2,
  ThumbsUp,
  MessageSquare,
  User,
  ArrowUpDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useProductStore, formatPrice } from '@/store/product-store';
import { useCartStore } from '@/store/cart-store';
import { useComparisonStore } from '@/store/comparison-store';
import { useRecentlyViewedStore } from '@/store/recently-viewed-store';
import ProductCard from '@/components/product/ProductCard';
import ReviewForm from '@/components/product/ReviewForm';
import RecentlyViewed from '@/components/product/RecentlyViewed';
import SocialShareBar from '@/components/product/SocialShareBar';
import StockNotifyButton from '@/components/product/StockNotifyButton';
import { JsonLd, generateProductSchema, generateBreadcrumbSchema } from '@/components/JsonLd';

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

interface ProductSpec {
  key: string;
  value: string;
}

interface Review {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  location: string;
  createdAt: string;
}

interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  description: string;
  features: string;
  specifications: string;
  images: string;
  priceGNF: number;
  originalPriceGNF: number | null;
  rating: number;
  ratingCount: number;
  stock: number;
  salesCount: number;
  isFeatured: boolean;
  isOfficial: boolean;
  seller: string | null;
  sellerVerified: boolean;
  colors: string;
  sizes: string | null;
  createdAt: string;
  category: { slug: string; name: string };
}

// ============================================================
// Product Page
// ============================================================

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { selectedCurrency } = useProductStore();
  const comparisonStore = useComparisonStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  // Lightbox state
  const [showLightbox, setShowLightbox] = useState(false);

  // Wishlist state
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Back to top state
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Image zoom state
  const zoomRef = useRef<HTMLDivElement>(null);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  // Ref for images length (stable reference for keyboard nav)
  const imagesLengthRef = useRef(0);

  // Parsed data (initialized empty, populated via useMemo)
  const parsedImages = useMemo((): ProductImage[] => {
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

  const parsedColors = useMemo((): ProductColor[] => {
    if (!product) return [];
    try { const c = JSON.parse(product.colors); return Array.isArray(c) ? c : []; } catch { return []; }
  }, [product]);

  const parsedSizes = useMemo((): ProductSize[] => {
    if (!product) return [];
    try { const s = JSON.parse(product.sizes || '[]'); return Array.isArray(s) ? s : []; } catch { return []; }
  }, [product]);

  const parsedFeatures = useMemo((): string[] => {
    if (!product) return [];
    try { const f = JSON.parse(product.features); return Array.isArray(f) ? f : []; } catch { return []; }
  }, [product]);

  const parsedSpecs = useMemo((): ProductSpec[] => {
    if (!product) return [];
    try {
      const sp = JSON.parse(product.specifications);
      if (Array.isArray(sp)) {
        return sp.map((spec: Record<string, string>) => ({
          key: spec.key || spec.name || '',
          value: spec.value || '',
        }));
      }
    } catch { /* ignore */ }
    return [];
  }, [product]);

  // Auto-select first color/size when product loads
  useEffect(() => {
    if (parsedColors.length > 0 && !selectedColor) {
      setSelectedColor(parsedColors[0].id);
    }
    if (parsedSizes.length > 0 && !selectedSize) {
      setSelectedSize(parsedSizes[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedColors, parsedSizes]);

  const images = parsedImages;
  const colors = parsedColors;
  const sizes = parsedSizes;
  const features = parsedFeatures;
  const specifications = parsedSpecs;

  const discount = product?.originalPriceGNF
    ? Math.round(((product.originalPriceGNF - product.priceGNF) / product.originalPriceGNF) * 100)
    : null;

  // Dynamic badge conditions
  const isNew = product?.createdAt
    ? (Date.now() - new Date(product.createdAt).getTime()) < 30 * 24 * 60 * 60 * 1000
    : false;
  const isPopular = (product?.salesCount ?? 0) > 50;
  const isLowStock = product ? (product.stock > 0 && product.stock <= 5) : false;

  const mainImage = images[selectedImageIndex]?.src || images[0]?.src || '/product-images/headphones-main.png';

  // Fetch product data
  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (!res.ok) {
          setError('Produit non trouv&eacute;');
          return;
        }
        const data = await res.json();
        setProduct(data.product);
        setRelated(data.related || []);
        setReviews(data.reviews || []);
      } catch {
        setError('Erreur lors du chargement du produit');
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  const addToCart = () => {
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
  };

  const buyNow = () => {
    addToCart();
    router.push('/panier');
  };

  // Keep imagesLengthRef in sync
  imagesLengthRef.current = images.length;

  // Back to top scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize wishlist state from localStorage
  useEffect(() => {
    try {
      const stored: string[] = JSON.parse(localStorage.getItem('le-marche-wishlist') || '[]');
      setIsWishlisted(Array.isArray(stored) && stored.includes(slug));
    } catch {
      setIsWishlisted(false);
    }
  }, [slug]);

  // Zoom mouse move handler
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomRef.current) return;
    const rect = zoomRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }, []);

  // Lightbox keyboard navigation
  useEffect(() => {
    if (!showLightbox) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowLightbox(false);
      if (e.key === 'ArrowLeft') {
        setSelectedImageIndex((prev) => {
          const len = imagesLengthRef.current;
          return prev === 0 ? len - 1 : prev - 1;
        });
      }
      if (e.key === 'ArrowRight') {
        setSelectedImageIndex((prev) => {
          const len = imagesLengthRef.current;
          return prev === len - 1 ? 0 : prev + 1;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLightbox]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (showLightbox) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showLightbox]);

  // Share handler
  const handleShare = useCallback(async () => {
    const shareData = {
      title: product?.name || '',
      text: `D\u00e9couvrez ${product?.name} sur notre boutique !`,
      url: window.location.href,
    };
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success('Lien copi\u00e9 dans le presse-papiers');
          } catch {
            toast.error('Impossible de copier le lien');
          }
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Lien copi\u00e9 dans le presse-papiers');
      } catch {
        toast.error('Impossible de copier le lien');
      }
    }
  }, [product]);

  // Wishlist toggle
  const toggleWishlist = useCallback(() => {
    try {
      const stored: string[] = JSON.parse(localStorage.getItem('le-marche-wishlist') || '[]');
      let updated: string[];
      if (stored.includes(slug)) {
        updated = stored.filter((s) => s !== slug);
        setIsWishlisted(false);
        toast.success('Retir\u00e9 des favoris');
      } else {
        updated = [...stored, slug];
        setIsWishlisted(true);
        toast.success('Ajout\u00e9 aux favoris');
      }
      localStorage.setItem('le-marche-wishlist', JSON.stringify(updated));
    } catch {
      toast.error('Erreur lors de la mise \u00e0 jour des favoris');
    }
  }, [slug]);

  // Comparison toggle
  const isInComparison = product ? comparisonStore.isInComparison(product.id) : false;

  const toggleComparison = useCallback(() => {
    if (!product) return;
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
        originalPriceGNF: product.originalPriceGNF,
        rating: product.rating,
        ratingCount: product.ratingCount,
        images: product.images,
        specifications: product.specifications,
        features: product.features,
        stock: product.stock,
        category: product.category,
      });
      toast.success('Ajout\u00e9 \u00e0 la comparaison');
    }
  }, [product, isInComparison, comparisonStore]);

  // Scroll to top handler
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Track recently viewed product
  useEffect(() => {
    if (product) {
      useRecentlyViewedStore.getState().addView(slug);
    }
  }, [slug, product]);

  // Refetch reviews after new review submission
  const handleReviewSubmitted = useCallback(() => {
    if (!product) return;
    async function refetchReviews() {
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data.reviews || []);
          // Also update product to get new rating
          if (data.product) {
            setProduct(data.product);
          }
        }
      } catch {
        // Silently fail - reviews already visible
      }
    }
    refetchReviews();
  }, [product, slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#1B5E20] animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <AlertTriangle className="w-12 h-12 text-[#FF8F00] mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Produit non trouv&eacute;</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{error || 'Ce produit n\'existe pas ou a &eacute;t&eacute; supprim&eacute;.'}</p>
        <Link href="/">
          <Button className="bg-[#1B5E20] hover:bg-[#145218] text-white">
            Retour &agrave; l&apos;accueil
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* JSON-LD Structured Data */}
      <JsonLd data={generateProductSchema(product)} />
      <JsonLd
        data={generateBreadcrumbSchema([
          { name: 'Accueil', url: '/' },
          { name: product.category.name, url: `/recherche?category=${product.category.slug}` },
          { name: product.name, url: `/produit/${product.slug}` },
        ])}
      />

      {/* Breadcrumb */}
      <nav className="bg-[#F7F8F8] dark:bg-gray-900 border-b border-[#EEE] dark:border-gray-800" aria-label="Breadcrumb">
        <div className="mx-auto max-w-[1500px] px-4 py-2">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-[#444] dark:text-gray-400">
            <li className="flex items-center gap-1">
              <Link href="/" className="text-[#005A6E] hover:text-[#E65100] hover:underline">Accueil</Link>
              <ChevronRight className="h-3 w-3 text-[#999]" />
            </li>
            <li className="flex items-center gap-1">
              <Link href={`/recherche?category=${product.category.slug}`} className="text-[#005A6E] hover:text-[#E65100] hover:underline">{product.category.name}</Link>
              <ChevronRight className="h-3 w-3 text-[#999]" />
            </li>
            <li className="text-[#0F1111] dark:text-gray-100 font-medium line-clamp-1">{product.name}</li>
          </ol>
        </div>
      </nav>

      <main className="mx-auto max-w-[1500px] px-4 py-6">
        {/* Product Layout */}
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Left: Images (40%) */}
          <div className="w-full lg:w-[40%] lg:sticky lg:top-[130px] lg:self-start lg:pr-6">
            {/* Main Image */}
            <div
              ref={zoomRef}
              className="relative aspect-square w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-hidden mb-3 cursor-zoom-in"
              onClick={() => setShowLightbox(true)}
              onMouseEnter={() => setIsZooming(true)}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setIsZooming(false)}
            >
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-contain p-4 transition-transform duration-150 select-none"
                draggable={false}
                style={{
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transform: isZooming ? 'scale(2)' : 'scale(1)',
                }}
              />
              {discount && discount > 0 && (
                <Badge className="absolute top-3 left-3 bg-[#B12704] text-white border-0 text-sm font-bold">
                  -{discount}%
                </Badge>
              )}
              {product.isOfficial && (
                <Badge className="absolute top-3 right-3 bg-[#1B5E20] text-white border-0 text-xs">
                  OFFICIEL
                </Badge>
              )}
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition-all ${
                      selectedImageIndex === idx
                        ? 'border-[#1B5E20] shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <img src={img.src} alt={img.alt || product.name} className="w-full h-full object-contain p-1" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Middle: Info (35%) */}
          <div className="w-full lg:w-[35%] lg:pr-6">
            {/* Title */}
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{product.name}</h1>
            {/* Brand */}
            <p className="text-sm text-[#444] dark:text-gray-300 mb-2">par <span className="font-medium text-[#005A6E] dark:text-[#4DD0E1]">{product.brand}</span></p>

            {/* Dynamic Badges */}
            {(isNew || isPopular || isLowStock || product.isOfficial || (discount && discount > 0)) && (
              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                {isNew && (
                  <Badge className="bg-blue-500 text-white border-0 text-[10px] font-medium">Nouveau</Badge>
                )}
                {isPopular && (
                  <Badge className="bg-amber-500 text-white border-0 text-[10px] font-medium">Populaire</Badge>
                )}
                {isLowStock && (
                  <Badge className="bg-red-500 text-white border-0 text-[10px] font-medium animate-pulse">
                    Stock limité — plus que {product.stock} !
                  </Badge>
                )}
                {product.isOfficial && (
                  <Badge className="bg-[#1B5E20] text-white border-0 text-[10px] font-medium">Officiel</Badge>
                )}
                {discount && discount > 0 && (
                  <Badge className="bg-[#B12704] text-white border-0 text-[10px] font-bold">-{discount}%</Badge>
                )}
              </div>
            )}

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className={`h-4 w-4 ${i <= Math.round(product.rating) ? 'text-[#FF8F00] fill-[#FF8F00]' : 'text-gray-300 dark:text-gray-600'}`} />
                ))}
              </div>
              <span className="text-sm text-[#005A6E] dark:text-[#4DD0E1]">{product.rating} ({product.ratingCount.toLocaleString()} &eacute;valuations)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl font-bold text-[#B12704]">{formatPrice(product.priceGNF, selectedCurrency)}</span>
              {product.originalPriceGNF && (
                <span className="text-base text-gray-400 line-through">{formatPrice(product.originalPriceGNF, selectedCurrency)}</span>
              )}
              {discount && (
                <Badge className="bg-[#FF8F00]/10 text-[#E65100] border-[#FF8F00]/30 text-xs">
                  -{discount}%
                </Badge>
              )}
            </div>

            <Separator className="my-4" />

            {/* Features */}
            {features.length > 0 && (
              <ul className="space-y-2 mb-4">
                {features.slice(0, 5).map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Check className="h-4 w-4 text-[#2E7D32] shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Colors */}
            {colors.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Couleur : <span className="text-[#444] dark:text-gray-300">{colors.find(c => c.id === selectedColor)?.label || ''}</span></p>
                <div className="flex gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color.id)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === color.id ? 'border-[#1B5E20] ring-2 ring-[#1B5E20]/20' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {sizes.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Taille</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size.id)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        selectedSize === size.id
                          ? 'border-[#1B5E20] bg-[#E8F5E9] text-[#1B5E20]'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Seller info */}
            {product.seller && (
              <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-[#F7F8F8] dark:bg-gray-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1B5E20] text-white text-xs font-bold">
                  {product.seller.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{product.seller}</p>
                  {product.sellerVerified && (
                    <p className="text-[10px] text-[#2E7D32] flex items-center gap-0.5">
                      <Check className="h-3 w-3" /> Vendeur v&eacute;rifi&eacute;
                    </p>
                  )}
                </div>
              </div>
            )}

            <Separator className="my-4" />

            {/* Delivery info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-[#2E7D32]" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Livraison disponible</p>
                  <p className="text-xs text-[#444] dark:text-gray-300">Livraison en 1-3 jours &agrave; Conakry</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="h-5 w-5 text-[#1565C0]" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Retour sous 14 jours</p>
                  <p className="text-xs text-[#444] dark:text-gray-300">Satisfait ou rembours&eacute;</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-[#1B5E20]" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Produit 100% authentique</p>
                  <p className="text-xs text-[#444] dark:text-gray-300">Garantie constructeur incluse</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Buy Box (25%) */}
          <div className="hidden lg:block lg:w-[25%]">
            <div className="sticky top-[130px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm">
              {/* Price in buy box */}
              <div className="mb-4">
                <span className="text-2xl font-bold text-[#B12704]">{formatPrice(product.priceGNF, selectedCurrency)}</span>
                {product.originalPriceGNF && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-400 line-through">{formatPrice(product.originalPriceGNF, selectedCurrency)}</span>
                    {discount && (
                      <Badge className="bg-[#B12704] text-white border-0 text-[10px]">-&Eacute;conomisez {formatPrice(product.originalPriceGNF - product.priceGNF, selectedCurrency)}</Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Stock */}
              <div className="mb-4">
                {product.stock > 0 ? (
                  <span className="text-sm text-[#2E7D32] font-medium flex items-center gap-1">
                    <Check className="h-4 w-4" /> En stock ({product.stock} disponibles)
                  </span>
                ) : (
                  <span className="text-sm text-[#CC0C39] font-medium flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" /> Rupture de stock
                  </span>
                )}
              </div>

              {/* Quantity */}
              {product.stock > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Quantit&eacute; :</p>
                  <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg w-fit overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 h-10 flex items-center justify-center text-sm font-semibold border-x border-gray-300 dark:border-gray-700">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Buttons - only when in stock */}
              {product.stock > 0 && (
              <div className="space-y-2">
                <Button
                  onClick={addToCart}
                  className="w-full bg-[#FF8F00] hover:bg-[#E68100] text-white py-5 text-sm font-semibold rounded-lg"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Ajouter au Panier
                </Button>
                <Button
                  onClick={buyNow}
                  className="w-full bg-[#1B5E20] hover:bg-[#145218] text-white py-5 text-sm font-semibold rounded-lg"
                >
                  Acheter Maintenant
                </Button>
              </div>
              )}

              {/* Stock Notification - when out of stock */}
              {product.stock === 0 && (
              <StockNotifyButton
                productId={product.id}
                productSlug={product.slug}
                productName={product.name}
              />
              )}

              {/* Wishlist + Share + Compare */}
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  onClick={toggleWishlist}
                  className={`flex-1 border-gray-200 dark:border-gray-700 text-xs h-9 transition-colors ${
                    isWishlisted
                      ? 'text-red-500 border-red-200 bg-red-50 hover:bg-red-100'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Heart className={`h-3.5 w-3.5 mr-1.5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} /> Favoris
                </Button>
                <Button
                  variant="outline"
                  onClick={toggleComparison}
                  className={`flex-1 border-gray-200 dark:border-gray-700 text-xs h-9 transition-colors ${
                    isInComparison
                      ? 'text-[#1B5E20] border-[#1B5E20] bg-[#E8F5E9] hover:bg-[#C8E6C9]'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <ArrowUpDown className={`h-3.5 w-3.5 mr-1.5 ${isInComparison ? 'text-[#1B5E20]' : ''}`} /> Comparer
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="flex-1 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs h-9"
                >
                  <Share2 className="h-3.5 w-3.5 mr-1.5" /> Partager
                </Button>
              </div>

              {/* Social Share Bar */}
              <div className="mt-3">
                <SocialShareBar productName={product.name} />
              </div>

              <Separator className="my-4" />

              {/* Payment methods */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Moyens de paiement :</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF3E0] px-2.5 py-1 text-[10px] font-medium text-[#E65100]">
                    <div className="h-2 w-2 rounded-full bg-[#FF6600]" /> Orange Money
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF8E1] px-2.5 py-1 text-[10px] font-medium text-[#F57C00]">
                    <div className="h-2 w-2 rounded-full bg-[#FFC107]" /> MTN MoMo
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#E3F2FD] px-2.5 py-1 text-[10px] font-medium text-[#1565C0]">
                    <div className="h-2 w-2 rounded-full bg-[#1DA1F2]" /> Wave
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F5E9] px-2.5 py-1 text-[10px] font-medium text-[#2E7D32]">
                    <div className="h-2 w-2 rounded-full bg-[#4CAF50]" /> Cash
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Buy Box */}
        <div className="mt-6 lg:hidden">
          <div className="mx-auto max-w-[400px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm">
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-xl font-bold text-[#B12704]">{formatPrice(product.priceGNF, selectedCurrency)}</span>
              {product.originalPriceGNF && (
                <span className="text-sm text-gray-400 line-through">{formatPrice(product.originalPriceGNF, selectedCurrency)}</span>
              )}
            </div>
            {product.stock > 0 ? (
              <span className="text-sm text-[#2E7D32] font-medium flex items-center gap-1 mb-3">
                <Check className="h-4 w-4" /> En stock
              </span>
            ) : (
              <span className="text-sm text-[#CC0C39] font-medium mb-3 block">Rupture de stock</span>
            )}
            {product.stock > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"><Minus className="h-4 w-4" /></button>
                <span className="w-10 h-9 flex items-center justify-center text-sm font-semibold border-x border-gray-300 dark:border-gray-700">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"><Plus className="h-4 w-4" /></button>
              </div>
            </div>
            )}
            {product.stock > 0 && (
            <div className="flex gap-2 mb-3">
              <Button onClick={addToCart} className="flex-1 bg-[#FF8F00] hover:bg-[#E68100] text-white py-5 text-sm font-semibold rounded-lg">
                <ShoppingCart className="h-4 w-4 mr-1.5" /> Panier
              </Button>
              <Button onClick={buyNow} className="flex-1 bg-[#1B5E20] hover:bg-[#145218] text-white py-5 text-sm font-semibold rounded-lg">
                Acheter
              </Button>
            </div>
            )}
            {product.stock === 0 && (
            <div className="mb-3">
              <StockNotifyButton
                productId={product.id}
                productSlug={product.slug}
                productName={product.name}
              />
            </div>
            )}
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                onClick={toggleWishlist}
                className={`flex-1 border-gray-200 dark:border-gray-700 text-xs h-9 transition-colors ${
                  isWishlisted
                    ? 'text-red-500 border-red-200 bg-red-50 hover:bg-red-100'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Heart className={`h-3.5 w-3.5 mr-1.5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} /> Favoris
              </Button>
              <Button
                variant="outline"
                onClick={toggleComparison}
                className={`flex-1 border-gray-200 dark:border-gray-700 text-xs h-9 transition-colors ${
                  isInComparison
                    ? 'text-[#1B5E20] border-[#1B5E20] bg-[#E8F5E9] hover:bg-[#C8E6C9]'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ArrowUpDown className={`h-3.5 w-3.5 mr-1.5 ${isInComparison ? 'text-[#1B5E20]' : ''}`} /> Comparer
              </Button>
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex-1 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs h-9"
              >
                <Share2 className="h-3.5 w-3.5 mr-1.5" /> Partager
              </Button>
            </div>

            {/* Social Share Bar - Mobile */}
            <div className="mt-3">
              <SocialShareBar productName={product.name} />
            </div>
          </div>
        </div>

        {/* Tabs: Description, Specs, Reviews */}
        <section className="mt-8">
          <Tabs defaultValue="description">
            <TabsList className="w-full justify-start border-b dark:border-gray-700 rounded-none bg-transparent h-auto p-0">
              <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent dark:border-gray-700 data-[state=active]:border-[#1B5E20] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100">
                Description
              </TabsTrigger>
              <TabsTrigger value="specs" className="rounded-none border-b-2 border-transparent dark:border-gray-700 data-[state=active]:border-[#1B5E20] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100">
                Caract&eacute;ristiques
              </TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent dark:border-gray-700 data-[state=active]:border-[#1B5E20] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100">
                Avis ({reviews.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="pt-6">
              <div className="prose prose-sm max-w-none">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{product.description}</p>
                {features.length > 0 && (
                  <>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-3">Points cl&eacute;s</h3>
                    <ul className="space-y-2">
                      {features.map((f, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <Check className="h-4 w-4 text-[#2E7D32] shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="specs" className="pt-6">
              {specifications.length > 0 ? (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  {specifications.map((spec, idx) => (
                    <div key={idx} className={`flex ${idx % 2 === 0 ? 'bg-[#F7F8F8] dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}`}>
                      <div className="w-1/3 px-4 py-3 text-xs font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">{spec.key}</div>
                      <div className="w-2/3 px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{spec.value}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">Aucune caract&eacute;ristique d&eacute;taill&eacute;e disponible.</p>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="pt-6">
              {/* Review Form */}
              <ReviewForm productId={product.id} onReviewSubmitted={handleReviewSubmitted} />

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {/* Rating summary */}
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-[#F7F8F8] dark:bg-gray-800">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{product.rating}</p>
                      <div className="flex items-center gap-0.5 mt-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className={`h-3 w-3 ${i <= Math.round(product.rating) ? 'text-[#FF8F00] fill-[#FF8F00]' : 'text-gray-300 dark:text-gray-600'}`} />
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">{product.ratingCount.toLocaleString()} avis</p>
                    </div>
                    <div className="flex-1 space-y-1">
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const count = reviews.filter(r => r.rating === stars).length;
                        const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                        return (
                          <div key={stars} className="flex items-center gap-2 text-xs">
                            <span className="w-3 text-gray-500 dark:text-gray-400">{stars}</span>
                            <Star className="h-3 w-3 text-[#FF8F00] fill-[#FF8F00]" />
                            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full bg-[#FF8F00] rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="w-6 text-right text-gray-500 dark:text-gray-400">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Individual reviews */}
                  {reviews.map((review) => (
                    <div key={review.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8F5E9] text-[#1B5E20] text-xs font-bold">
                            {review.author.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{review.author}</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              {review.location && <span>{review.location}</span>}
                              {review.verified && (
                                <span className="flex items-center gap-0.5 text-[#2E7D32]"><Check className="h-3 w-3" /> Achat v&eacute;rifi&eacute;</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">{new Date(review.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center gap-0.5 mb-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className={`h-3 w-3 ${i <= review.rating ? 'text-[#FF8F00] fill-[#FF8F00]' : 'text-gray-300 dark:text-gray-600'}`} />
                        ))}
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{review.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{review.body}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-gray-400 dark:text-gray-500">Aucun autre avis pour le moment. Soyez le premier !</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>

        {/* Recently Viewed Products */}
        <section className="mt-10">
          <RecentlyViewed />
        </section>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              Produits similaires
              <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-600" />
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Image Lightbox Overlay */}
      {showLightbox && images.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setShowLightbox(false)}
        >
          {/* Close button */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowLightbox(false); }}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Fermer"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-4 z-10 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
            {selectedImageIndex + 1} / {images.length}
          </div>

          {/* Previous button */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
              }}
              className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Image pr\u00e9c\u00e9dente"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Lightbox image */}
          <img
            src={images[selectedImageIndex]?.src || mainImage}
            alt={images[selectedImageIndex]?.alt || product.name}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg bg-transparent"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next button */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
              }}
              className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Image suivante"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      )}

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#1B5E20] text-white shadow-lg hover:bg-[#145218] transition-all hover:scale-110"
          aria-label="Retour en haut"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
