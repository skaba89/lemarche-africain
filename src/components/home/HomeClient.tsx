'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ChevronRight,
  ArrowRight,
  TrendingUp,
  Clock,
  Star,
  Store,
  Headphones,
  Smartphone,
  Laptop,
  Home as HomeIcon,
  Watch,
  Dumbbell,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FlashSaleBanner } from '@/components/product/FlashSaleBanner';
import { ReferralSection } from '@/components/product/ReferralSection';
import NewsletterSection from '@/components/NewsletterSection';
import BundleDeals from '@/components/product/BundleDeals';
import { SocialProofNotification } from '@/components/product/SocialProof';
import { FloatingWhatsApp } from '@/components/product/FloatingWhatsApp';
import ProductCard from '@/components/product/ProductCard';
import PromoCarousel from '@/components/home/PromoCarousel';
import TrustIndicators from '@/components/home/TrustIndicators';
import { useProductStore } from '@/store/product-store';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/motion/FadeIn';

// ============================================================
// Types
// ============================================================

interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
  productCount: number;
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
  images: string;
  isOfficial: boolean;
  stock: number;
  isFeatured: boolean;
  salesCount: number;
  createdAt: string;
  category: { slug: string; name: string };
}

interface HomeClientProps {
  categories: Category[];
  featuredProducts: Product[];
  bestSellers: Product[];
  newArrivals: Product[];
  allProducts: Product[];
  allHasMore: boolean;
}

// ============================================================
// Category icons mapping
// ============================================================

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  audio: Headphones,
  telephones: Smartphone,
  informatique: Laptop,
  maison: HomeIcon,
  accessoires: Watch,
  sport: Dumbbell,
};

function getCategoryIcon(slug: string): React.ElementType {
  return CATEGORY_ICONS[slug] || Store;
}

// ============================================================
// Home Client Component
// ============================================================

export default function HomeClient({
  categories,
  featuredProducts,
  bestSellers,
  newArrivals,
  allProducts: initialAllProducts,
  allHasMore: initialAllHasMore,
}: HomeClientProps) {
  const router = useRouter();
  const { selectedCurrency } = useProductStore();
  const [searchQuery, setSearchQuery] = useState('');

  // All products pagination state
  const [allProducts, setAllProducts] = useState<Product[]>(initialAllProducts);
  const [allPage, setAllPage] = useState(1);
  const [allHasMore, setAllHasMore] = useState(initialAllHasMore);
  const [loadingMore, setLoadingMore] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/recherche?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const loadMoreProducts = async () => {
    setLoadingMore(true);
    try {
      const nextPage = allPage + 1;
      const res = await fetch(`/api/products?sort=newest&limit=8&page=${nextPage}`);
      const data = await res.json();
      if (data.products) {
        setAllProducts((prev) => [...prev, ...data.products]);
        setAllPage(nextPage);
        setAllHasMore(data.pagination?.hasNext || false);
      }
    } catch (err) {
      console.error('Error loading more products:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      {/* Hero Section */}
      <FadeIn delay={0}>
      <section className="relative bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#1B5E20] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-[#FF8F00] blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#A5D6A7] blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-[1500px] px-4 py-10 md:py-16">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Store className="h-6 w-6 text-[#FF8F00]" />
              <h1 className="text-2xl md:text-4xl font-bold">
                Le <span className="text-[#FF8F00]">March&eacute;</span> Africain
              </h1>
            </div>
            <p className="text-sm md:text-base text-[#B9F6CA] max-w-lg">
              Le meilleur march&eacute; en ligne d&apos;Afrique. Produits authentiques, livraison rapide, paiement mobile local.
            </p>
          </div>

          {/* Hero Search */}
          <form onSubmit={handleSearch} className="mx-auto max-w-2xl mb-8">
            <div className="flex rounded-xl overflow-hidden shadow-lg">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Que recherchez-vous aujourd'hui ?"
                className="h-12 border-none bg-white px-4 text-sm text-[#0F1111] rounded-none focus-visible:ring-0"
              />
              <Button
                type="submit"
                className="bg-[#FF8F00] hover:bg-[#F57C00] text-white h-12 px-6 rounded-none font-medium"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </form>

          {/* Quick category links */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat.id}
                href={`/recherche?category=${cat.slug}`}
                className="flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 text-xs font-medium text-white transition-colors"
              >
                {(() => { const Icon = getCategoryIcon(cat.slug); return <Icon className="h-3.5 w-3.5" />; })()}
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
      </FadeIn>

      <div className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-6 pb-24 space-y-8">

        {/* Flash Sale Banner */}
        <FadeIn delay={0.05}>
        <div className="mb-2">
          <FlashSaleBanner />
        </div>
        </FadeIn>

        {/* Promo Carousel */}
        <FadeIn delay={0.07}>
        <div className="mb-2">
          <PromoCarousel />
        </div>
        </FadeIn>

        {/* Categories Grid */}
        {categories.length > 0 && (
          <FadeIn delay={0.1}>
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Store className="h-5 w-5 text-[#1B5E20]" />
                Nos Cat&eacute;gories
              </h2>
              <Link href="/recherche" className="text-xs text-[#1B5E20] hover:underline flex items-center gap-1">
                Voir tout <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <StaggerContainer className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {categories.map((cat) => {
                const Icon = getCategoryIcon(cat.slug);
                return (
                  <StaggerItem key={cat.id}>
                  <Link
                    href={`/recherche?category=${cat.slug}`}
                    className="group flex flex-col items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:border-[#1B5E20] hover:shadow-md transition-all"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F5E9] text-[#1B5E20] group-hover:bg-[#1B5E20] group-hover:text-white transition-colors">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{cat.name}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">{cat.productCount} articles</p>
                    </div>
                  </Link>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </section>
          </FadeIn>
        )}

        {/* Trust Indicators */}
        <FadeIn delay={0.12}>
          <TrustIndicators />
        </FadeIn>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <FadeIn delay={0.1}>
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Star className="h-5 w-5 text-[#FF8F00]" />
                Produits Vedettes
              </h2>
              <Link href="/recherche?featured=true" className="text-xs text-[#1B5E20] hover:underline flex items-center gap-1">
                Voir tout <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {featuredProducts.map((product) => (
                <StaggerItem key={product.id}>
                  <ProductCard product={product} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>
          </FadeIn>
        )}

        {/* Best Sellers */}
        {bestSellers.length > 0 && (
          <FadeIn delay={0.15}>
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#CC0C39]" />
                Meilleures Ventes
              </h2>
              <Link href="/recherche?sort=popular" className="text-xs text-[#1B5E20] hover:underline flex items-center gap-1">
                Voir tout <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {bestSellers.map((product) => (
                <StaggerItem key={product.id}>
                  <ProductCard product={product} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>
          </FadeIn>
        )}

        {/* New Arrivals */}
        {newArrivals.length > 0 && (
          <FadeIn delay={0.15}>
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#1565C0]" />
                Nouveaut&eacute;s
              </h2>
              <Link href="/recherche?sort=newest" className="text-xs text-[#1B5E20] hover:underline flex items-center gap-1">
                Voir tout <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {newArrivals.map((product) => (
                <StaggerItem key={product.id}>
                  <ProductCard product={product} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>
          </FadeIn>
        )}

        {/* Bundle Deals */}
        <FadeIn delay={0.18}>
        <section>
          <BundleDeals />
        </section>
        </FadeIn>

        {/* All Products */}
        <FadeIn delay={0.2}>
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#444]" />
              Tous les Produits
            </h2>
          </div>
          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {allProducts.map((product) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} />
              </StaggerItem>
            ))}
          </StaggerContainer>
          {allHasMore && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={loadMoreProducts}
                disabled={loadingMore}
                variant="outline"
                className="text-sm border-[#1B5E20] text-[#1B5E20] hover:bg-[#E8F5E9]"
              >
                {loadingMore ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Chargement...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Voir plus de produits <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </div>
          )}
        </section>
        </FadeIn>

        {/* Newsletter */}
        <FadeIn delay={0.2}>
        <section id="newsletter-section">
          <NewsletterSection />
        </section>
        </FadeIn>

        {/* Referral & Trust */}
        <FadeIn delay={0.2}>
        <section className="mt-10">
          <ReferralSection />
        </section>
        </FadeIn>
      </div>

      {/* Floating overlays */}
      <SocialProofNotification />
      <FloatingWhatsApp />
    </div>
  );
}
