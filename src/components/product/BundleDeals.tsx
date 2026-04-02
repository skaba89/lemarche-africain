'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Package, ShoppingCart, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProductStore, formatPrice } from '@/store/product-store';
import { useCartStore } from '@/store/cart-store';
import { toast } from 'sonner';

// ============================================================
// Types
// ============================================================

interface BundleItem {
  slug: string;
  name: string;
  qty: number;
}

interface Bundle {
  id: string;
  name: string;
  description: string;
  items: BundleItem[];
  discount: number;
}

interface FetchedProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  priceGNF: number;
  originalPriceGNF: number | null;
  images: string;
  stock: number;
}

interface ResolvedBundle extends Bundle {
  products: (FetchedProduct & { qty: number })[];
  totalOriginal: number;
  totalBundle: number;
  savings: number;
}

// ============================================================
// Bundle Definitions
// ============================================================

const bundles: Bundle[] = [
  {
    id: 'audio-complete',
    name: 'Pack Audio Complet',
    description: 'Casque + Enceinte + Ecouteurs pour une experience sonore totale',
    items: [
      { slug: 'soundcore-pro-x1', name: 'SoundCore Pro X1', qty: 1 },
      { slug: 'soundcore-boom-3', name: 'SoundCore Boom 3', qty: 1 },
      { slug: 'soundcore-elite-sport', name: 'SoundCore Elite Sport', qty: 1 },
    ],
    discount: 20,
  },
  {
    id: 'smartphone-kit',
    name: 'Kit Smartphone Essentiel',
    description: 'Telephone + Batterie externe pour ne jamais etre a court d\'energie',
    items: [
      { slug: 'samsung-galaxy-a54', name: 'Samsung Galaxy A54', qty: 1 },
      { slug: 'anker-powercore-20000', name: 'Anker PowerCore 20000', qty: 1 },
    ],
    discount: 15,
  },
  {
    id: 'gaming-setup',
    name: 'Pack Gaming',
    description: 'Casque gaming + Support premium pour les longues sessions',
    items: [
      { slug: 'casque-gaming-rgb', name: 'ProGamer Headset RGB', qty: 1 },
      { slug: 'support-premium-aluminium', name: 'Support Premium Aluminium', qty: 1 },
    ],
    discount: 10,
  },
  {
    id: 'mobile-power',
    name: 'Pack Energie Mobile',
    description: 'Telephone + Batterie externe haute capacite + Ecouteurs Bluetooth',
    items: [
      { slug: 'tecno-spark-20-pro', name: 'Tecno Spark 20 Pro', qty: 1 },
      { slug: 'oraimo-powerbank-30000', name: 'Oraimo PowerBank 30000', qty: 1 },
      { slug: 'samsung-galaxy-buds-fe', name: 'Samsung Galaxy Buds FE', qty: 1 },
    ],
    discount: 12,
  },
];

// ============================================================
// BundleDeals Component
// ============================================================

export default function BundleDeals() {
  const router = useRouter();
  const selectedCurrency = useProductStore((s) => s.selectedCurrency);
  const [resolvedBundles, setResolvedBundles] = useState<ResolvedBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingBundleId, setAddingBundleId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBundleProducts() {
      try {
        const results: ResolvedBundle[] = [];

        for (const bundle of bundles) {
          const productPromises = bundle.items.map(async (item) => {
            try {
              const res = await fetch(`/api/products/${item.slug}`);
              if (res.ok) {
                const data = await res.json();
                return { ...data, qty: item.qty } as FetchedProduct & { qty: number };
              }
            } catch {
              // Product not found, skip
            }
            return null;
          });

          const products = (await Promise.all(productPromises)).filter(
            (p): p is FetchedProduct & { qty: number } => p !== null
          );

          if (products.length > 0) {
            const totalOriginal = products.reduce(
              (sum, p) => sum + p.priceGNF * p.qty,
              0
            );
            const totalBundle = Math.round(totalOriginal * (1 - bundle.discount / 100));
            const savings = totalOriginal - totalBundle;

            results.push({
              ...bundle,
              products,
              totalOriginal,
              totalBundle,
              savings,
            });
          }
        }

        setResolvedBundles(results);
      } catch (err) {
        console.error('Error fetching bundle products:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchBundleProducts();
  }, []);

  const addBundleToCart = useCallback(
    async (bundle: ResolvedBundle) => {
      setAddingBundleId(bundle.id);

      try {
        let totalItems = 0;

        for (const product of bundle.products) {
          let images: string[] = [];
          try {
            images = JSON.parse(product.images);
          } catch {
            images = [];
          }

          for (let i = 0; i < product.qty; i++) {
            useCartStore.getState().addItem({
              productId: product.id,
              productSlug: product.slug,
              productName: product.name,
              image: images[0] || '/product-images/default.png',
              color: 'default',
              colorLabel: 'Standard',
              size: 'default',
              sizeLabel: 'Standard',
              priceGNF: product.priceGNF,
              originalPriceGNF: product.originalPriceGNF || product.priceGNF,
              quantity: 1,
              stock: product.stock,
            });
            totalItems += 1;
          }
        }

        toast.success(`Pack ${bundle.name} ajoute au panier (${totalItems} articles)`);

        setTimeout(() => {
          router.push('/panier');
        }, 800);
      } catch {
        toast.error('Erreur lors de l\'ajout du pack au panier');
      } finally {
        setAddingBundleId(null);
      }
    },
    [router]
  );

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="space-y-2">
          <div className="h-7 w-72 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4 animate-pulse">
              <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-64 bg-gray-100 dark:bg-gray-800 rounded" />
              <div className="flex gap-2">
                <div className="h-14 w-14 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="h-14 w-14 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="h-14 w-14 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              </div>
              <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (resolvedBundles.length === 0) return null;

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-[#FF8F00]" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          Offres Bundles &mdash; Economisez plus en achetant ensemble
        </h2>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Des packs exclusifs selectionnes pour vous
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resolvedBundles.map((bundle) => (
          <div
            key={bundle.id}
            className="relative rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            {/* Discount Badge */}
            <div className="absolute top-3 right-3 z-10">
              <Badge className="bg-[#B12704] text-white border-0 text-xs font-bold px-2.5 py-0.5">
                ECONOMISEZ {bundle.discount}%
              </Badge>
            </div>

            <div className="p-5">
              {/* Bundle header */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F5E9] text-[#1B5E20]">
                  <Package className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 pr-20">
                  {bundle.name}
                </h3>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                {bundle.description}
              </p>

              {/* Product thumbnails */}
              <div className="flex items-center gap-2 mb-4">
                {bundle.products.map((product, idx) => {
                  let images: string[] = [];
                  try { images = JSON.parse(product.images); } catch { images = []; }
                  const img = images[0] || '/product-images/default.png';

                  return (
                    <div key={product.slug} className="flex items-center gap-2">
                      <div className="h-14 w-14 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 overflow-hidden shrink-0">
                        <img
                          src={img}
                          alt={product.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium text-gray-900 dark:text-gray-100 truncate">
                          {product.name}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {formatPrice(product.priceGNF, selectedCurrency)}
                        </p>
                      </div>
                      {idx < bundle.products.length - 1 && (
                        <span className="text-gray-300 dark:text-gray-600 font-bold mx-1">+</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pricing */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
                      Prix total separe
                    </p>
                    <p className="text-sm text-gray-400 line-through">
                      {formatPrice(bundle.totalOriginal, selectedCurrency)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
                      Prix du pack
                    </p>
                    <p className="text-lg font-bold text-[#1B5E20]">
                      {formatPrice(bundle.totalBundle, selectedCurrency)}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-[#FF8F00]" />
                  <span className="text-xs font-semibold text-[#FF8F00]">
                    Vous economisez {formatPrice(bundle.savings, selectedCurrency)}
                  </span>
                </div>
              </div>

              {/* Add to cart button */}
              <Button
                onClick={() => addBundleToCart(bundle)}
                disabled={addingBundleId === bundle.id}
                className="w-full bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-medium h-10 text-sm"
              >
                {addingBundleId === bundle.id ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Ajout en cours...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Ajouter le pack au panier
                  </span>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
