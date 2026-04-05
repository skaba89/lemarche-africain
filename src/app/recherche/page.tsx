'use client';

import { useState, useEffect, useCallback, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  X,
  Check,
  Filter,
  Loader2,
  Star,
  ChevronDown,
  ChevronUp,
  PackageCheck,
  Flame,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ProductCard from '@/components/product/ProductCard';
import ProductCardSkeleton from '@/components/product/ProductCardSkeleton';

// ============================================================
// Types
// ============================================================

interface SearchResult {
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
  salesCount: number;
  createdAt: string;
  category: { slug: string; name: string };
}

interface CategoryItem {
  slug: string;
  name: string;
}

interface BrandFacet {
  name: string;
  count: number;
}

// ============================================================
// Constants
// ============================================================

const PRICE_RANGES = [
  { label: 'Moins de 500 000 GNF', min: 0, max: 500000 },
  { label: '500K \u2014 1M GNF', min: 500000, max: 1000000 },
  { label: '1M \u2014 3M GNF', min: 1000000, max: 3000000 },
  { label: 'Plus de 3M GNF', min: 3000000, max: Infinity },
];

const SORT_OPTIONS = [
  { value: 'popular', label: 'Meilleures ventes', icon: Flame },
  { value: 'newest', label: 'Nouveaut\u00e9s', icon: Clock },
  { value: 'rating', label: 'Meilleures notes', icon: Star },
  { value: 'price_asc', label: 'Prix croissant', icon: null },
  { value: 'price_desc', label: 'Prix d\u00e9croissant', icon: null },
] as const;

const BRANDS_SHOW_INITIAL = 5;

// ============================================================
// Collapsible section component
// ============================================================

function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 dark:border-gray-700/50 pb-4 last:border-0 last:pb-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left mb-2"
      >
        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          {title}
        </h4>
        {isOpen ? (
          <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        )}
      </button>
      {isOpen && children}
    </div>
  );
}

// ============================================================
// Inner search content (needs useSearchParams)
// ============================================================

function RechercheContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';

  const [searchInput, setSearchInput] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const [showAllBrands, setShowAllBrands] = useState(false);

  // API state
  const [results, setResults] = useState<SearchResult[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [brandFacets, setBrandFacets] = useState<BrandFacet[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch categories
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data.map((c: { slug: string; name: string }) => ({ slug: c.slug, name: c.name })));
        }
      })
      .catch(() => {});
  }, []);

  const fetchResults = useCallback(async (pageNum: number, append: boolean) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const params = new URLSearchParams();
      params.set('q', searchInput || initialQuery);
      if (selectedCategories.length > 0) params.set('category', selectedCategories[0]);
      if (selectedBrands.length > 0) params.set('brand', selectedBrands.join(','));
      if (selectedRating > 0) params.set('rating', String(selectedRating));
      if (inStockOnly) params.set('inStock', 'true');
      if (onSaleOnly) params.set('onSale', 'true');
      if (selectedPriceRange !== null) {
        params.set('minPrice', String(PRICE_RANGES[selectedPriceRange].min));
        params.set('maxPrice', String(PRICE_RANGES[selectedPriceRange].max));
      }
      params.set('sort', sortBy);
      params.set('page', String(pageNum));
      params.set('limit', '12');

      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();

      if (data.products) {
        setResults((prev) => append ? [...prev, ...data.products] : data.products);
        setTotalResults(data.pagination?.total || 0);
        setHasMore(data.pagination?.hasNext || false);
      }
      if (data.facets?.brands) {
        setBrandFacets(data.facets.brands);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchInput, initialQuery, selectedCategories, selectedBrands, selectedRating, inStockOnly, onSaleOnly, selectedPriceRange, sortBy]);

  // Initial fetch + refetch on filter change
  useEffect(() => {
    setPage(1);
    fetchResults(1, false);
  }, [fetchResults]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchResults(nextPage, true);
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [cat]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  // Compute active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategories.length > 0) count++;
    if (selectedPriceRange !== null) count++;
    if (selectedBrands.length > 0) count++;
    if (selectedRating > 0) count++;
    if (inStockOnly) count++;
    if (onSaleOnly) count++;
    return count;
  }, [selectedCategories, selectedPriceRange, selectedBrands, selectedRating, inStockOnly, onSaleOnly]);

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedPriceRange(null);
    setSelectedBrands([]);
    setSelectedRating(0);
    setInStockOnly(false);
    setOnSaleOnly(false);
    setSortBy('popular');
  };

  const removeFilter = (type: string) => {
    switch (type) {
      case 'category':
        setSelectedCategories([]);
        break;
      case 'price':
        setSelectedPriceRange(null);
        break;
      case 'brand':
        setSelectedBrands([]);
        break;
      case 'rating':
        setSelectedRating(0);
        break;
      case 'inStock':
        setInStockOnly(false);
        break;
      case 'onSale':
        setOnSaleOnly(false);
        break;
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/recherche?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  // Brands to show
  const displayedBrands = showAllBrands ? brandFacets : brandFacets.slice(0, BRANDS_SHOW_INITIAL);
  const hasMoreBrands = brandFacets.length > BRANDS_SHOW_INITIAL;

  // Rating distribution for current results
  const ratingDistribution = useMemo(() => {
    const dist = [0, 0, 0, 0, 0]; // 5+, 4+, 3+, 2+, 1+
    results.forEach((p) => {
      const r = Math.ceil(p.rating);
      for (let i = 0; i < Math.min(r, 5); i++) {
        dist[i]++;
      }
    });
    return dist;
  }, [results]);

  // Filter sidebar props
  const filterSidebarProps = {
    categories,
    selectedCategories,
    toggleCategory,
    selectedPriceRange,
    setSelectedPriceRange,
    brandFacets: displayedBrands,
    selectedBrands,
    toggleBrand,
    selectedRating,
    setSelectedRating,
    inStockOnly,
    setInStockOnly,
    onSaleOnly,
    setOnSaleOnly,
    showAllBrands,
    setShowAllBrands,
    hasMoreBrands,
    sortBy,
    setSortBy,
    clearFilters,
    activeFilterCount,
    ratingDistribution,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 sticky top-[104px] z-30">
        <div className="max-w-6xl mx-auto">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
            <Input
              placeholder="Rechercher un produit, une marque..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 h-11 rounded-xl border-gray-300 text-sm"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Results header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            {(searchInput || initialQuery) ? (
              <h2 className="text-sm text-gray-700 dark:text-gray-300">
                R&eacute;sultats pour{' '}
                <span className="font-semibold text-gray-900 dark:text-gray-100">&quot;{searchInput || initialQuery}&quot;</span>
              </h2>
            ) : (
              <h2 className="text-sm text-gray-700 dark:text-gray-300">Tous les produits</h2>
            )}
            <p className="text-xs text-gray-500 mt-0.5">{totalResults} produit{totalResults !== 1 ? 's' : ''} trouv&eacute;{totalResults !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Sort pills - desktop */}
            <div className="hidden lg:flex items-center gap-1.5">
              {SORT_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                      sortBy === opt.value
                        ? 'bg-[#1B5E20] text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {Icon && <Icon className="w-3 h-3" />}
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden text-xs h-8"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
              Filtres
              {activeFilterCount > 0 && (
                <Badge className="ml-1.5 bg-[#FF8F00] text-white border-0 text-[10px] px-1.5 min-w-[18px]">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Sort pills - mobile */}
        <div className="lg:hidden mb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 -mx-1 px-1">
            {SORT_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                    sortBy === opt.value
                      ? 'bg-[#1B5E20] text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {Icon && <Icon className="w-3 h-3" />}
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-5">
          {/* Filter Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <FilterSidebar {...filterSidebarProps} />
          </aside>

          {/* Filter Mobile Drawer */}
          {showFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
              <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl max-h-[85vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#1B5E20]" />
                    Filtres
                    {activeFilterCount > 0 && (
                      <Badge className="bg-[#FF8F00] text-white border-0 text-[10px] px-1.5">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </h3>
                  <button onClick={() => setShowFilters(false)} className="p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="overflow-y-auto p-4 flex-1">
                  <FilterSidebar {...filterSidebarProps} />
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
                  <div className="flex gap-2">
                    {activeFilterCount > 0 && (
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={clearFilters}
                      >
                        Effacer tout
                      </Button>
                    )}
                    <Button
                      className="flex-1 bg-[#1B5E20] hover:bg-[#145218] text-white"
                      onClick={() => setShowFilters(false)}
                    >
                      Voir {totalResults} r&eacute;sultats
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Active Filters */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs text-gray-500">Filtres actifs :</span>
                {selectedCategories.map((cat) => {
                  const catName = categories.find(c => c.slug === cat)?.name || cat;
                  return (
                    <Badge
                      key="category"
                      variant="secondary"
                      className="text-xs flex items-center gap-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                      onClick={() => removeFilter('category')}
                    >
                      {catName}
                      <X className="w-3 h-3" />
                    </Badge>
                  );
                })}
                {selectedBrands.map((brand) => (
                  <Badge
                    key={brand}
                    variant="secondary"
                    className="text-xs flex items-center gap-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                    onClick={() => {
                      setSelectedBrands((prev) => prev.filter((b) => b !== brand));
                    }}
                  >
                    {brand}
                    <X className="w-3 h-3" />
                  </Badge>
                ))}
                {selectedPriceRange !== null && (
                  <Badge
                    variant="secondary"
                    className="text-xs flex items-center gap-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                    onClick={() => removeFilter('price')}
                  >
                    {PRICE_RANGES[selectedPriceRange].label}
                    <X className="w-3 h-3" />
                  </Badge>
                )}
                {selectedRating > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-xs flex items-center gap-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                    onClick={() => removeFilter('rating')}
                  >
                    {selectedRating}+ &eacute;toiles
                    <X className="w-3 h-3" />
                  </Badge>
                )}
                {inStockOnly && (
                  <Badge
                    variant="secondary"
                    className="text-xs flex items-center gap-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                    onClick={() => removeFilter('inStock')}
                  >
                    En stock
                    <X className="w-3 h-3" />
                  </Badge>
                )}
                {onSaleOnly && (
                  <Badge
                    variant="secondary"
                    className="text-xs flex items-center gap-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                    onClick={() => removeFilter('onSale')}
                  >
                    En promotion
                    <X className="w-3 h-3" />
                  </Badge>
                )}
                <button
                  onClick={clearFilters}
                  className="text-xs text-[#B12704] hover:underline ml-1"
                >
                  Effacer tout
                </button>
              </div>
            )}

            {/* Loading state */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : results.length === 0 ? (
              /* No results */
              <div className="flex flex-col items-center justify-center py-20">
                <Search className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Aucun r&eacute;sultat</h3>
                <p className="text-sm text-gray-500 text-center mb-6 max-w-sm">
                  Nous n&apos;avons trouv&eacute; aucun produit correspondant &agrave; votre recherche. Essayez avec d&apos;autres mots-cl&eacute;s.
                </p>
                <Link href="/">
                  <Button className="bg-[#1B5E20] hover:bg-[#145218] text-white">
                    Retour &agrave; l&apos;accueil
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {/* Product Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {results.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Load more */}
                {hasMore && (
                  <div className="flex justify-center mt-6">
                    <Button
                      variant="outline"
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="text-sm text-gray-600 border-[#1B5E20] text-[#1B5E20] hover:bg-[#E8F5E9]"
                    >
                      {loadingMore ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" /> Chargement...
                        </span>
                      ) : (
                        'Voir plus de r\u00e9sultats'
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Filter Sidebar Component
// ============================================================

function FilterSidebar({
  categories,
  selectedCategories,
  toggleCategory,
  selectedPriceRange,
  setSelectedPriceRange,
  brandFacets,
  selectedBrands,
  toggleBrand,
  selectedRating,
  setSelectedRating,
  inStockOnly,
  setInStockOnly,
  onSaleOnly,
  setOnSaleOnly,
  showAllBrands,
  setShowAllBrands,
  hasMoreBrands,
  sortBy,
  setSortBy,
  clearFilters,
  activeFilterCount,
  ratingDistribution,
}: {
  categories: CategoryItem[];
  selectedCategories: string[];
  toggleCategory: (cat: string) => void;
  selectedPriceRange: number | null;
  setSelectedPriceRange: (i: number | null) => void;
  brandFacets: BrandFacet[];
  selectedBrands: string[];
  toggleBrand: (brand: string) => void;
  selectedRating: number;
  setSelectedRating: (r: number) => void;
  inStockOnly: boolean;
  setInStockOnly: (v: boolean) => void;
  onSaleOnly: boolean;
  setOnSaleOnly: (v: boolean) => void;
  showAllBrands: boolean;
  setShowAllBrands: (v: boolean) => void;
  hasMoreBrands: boolean;
  sortBy: string;
  setSortBy: (v: string) => void;
  clearFilters: () => void;
  activeFilterCount: number;
  ratingDistribution: number[];
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4 sticky top-[160px] max-h-[calc(100vh-180px)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#1B5E20]" />
          Filtres
        </h3>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-xs text-[#B12704] hover:underline"
          >
            Effacer tout
          </button>
        )}
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <CollapsibleSection title="Cat\u00e9gories">
          <div className="space-y-1.5">
            {categories.map((cat) => (
              <label
                key={cat.slug}
                className="flex items-center gap-2.5 cursor-pointer group py-0.5"
              >
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                    selectedCategories.includes(cat.slug)
                      ? 'bg-[#1B5E20] border-[#1B5E20]'
                      : 'border-gray-300 dark:border-gray-600 group-hover:border-gray-400'
                  }`}
                  onClick={() => toggleCategory(cat.slug)}
                >
                  {selectedCategories.includes(cat.slug) && (
                    <Check className="w-2.5 h-2.5 text-white" />
                  )}
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900">{cat.name}</span>
              </label>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Brands */}
      {brandFacets.length > 0 && (
        <CollapsibleSection title="Marques">
          <div className="space-y-1.5">
            {brandFacets.map((b) => (
              <label
                key={b.name}
                className="flex items-center gap-2.5 cursor-pointer group py-0.5"
              >
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                    selectedBrands.includes(b.name)
                      ? 'bg-[#1B5E20] border-[#1B5E20]'
                      : 'border-gray-300 dark:border-gray-600 group-hover:border-gray-400'
                  }`}
                  onClick={() => toggleBrand(b.name)}
                >
                  {selectedBrands.includes(b.name) && (
                    <Check className="w-2.5 h-2.5 text-white" />
                  )}
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 flex-1 truncate">{b.name}</span>
                <span className="text-[10px] text-gray-400">{b.count}</span>
              </label>
            ))}
            {hasMoreBrands && (
              <button
                onClick={() => setShowAllBrands(!showAllBrands)}
                className="text-xs text-[#005A6E] hover:underline flex items-center gap-0.5 mt-1"
              >
                {showAllBrands ? (
                  <><ChevronUp className="w-3 h-3" /> Moins</>
                ) : (
                  <><ChevronDown className="w-3 h-3" /> Plus ({brandFacets.length - BRANDS_SHOW_INITIAL})</>
                )}
              </button>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Rating */}
      <CollapsibleSection title="Note minimale">
        <div className="space-y-1.5">
          {[4, 3, 2, 1].map((stars) => (
            <button
              key={stars}
              onClick={() => setSelectedRating(selectedRating === stars ? 0 : stars)}
              className={`flex items-center gap-2 w-full py-0.5 px-1 rounded-md transition-colors ${
                selectedRating === stars
                  ? 'bg-[#1B5E20]/5 dark:bg-[#1B5E20]/10'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i <= stars
                        ? 'text-[#FF8F00] fill-[#FF8F00]'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">&amp; plus</span>
              <span className="text-[10px] text-gray-400 ml-auto">{ratingDistribution[5 - stars]}</span>
            </button>
          ))}
        </div>
      </CollapsibleSection>

      {/* Price Range */}
      <CollapsibleSection title="Fourchette de prix">
        <div className="space-y-1.5">
          {PRICE_RANGES.map((range, idx) => (
            <label
              key={range.label}
              className="flex items-center gap-2.5 cursor-pointer group py-0.5"
            >
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedPriceRange === idx
                    ? 'border-[#1B5E20]'
                    : 'border-gray-300 dark:border-gray-600 group-hover:border-gray-400'
                }`}
                onClick={() => setSelectedPriceRange(selectedPriceRange === idx ? null : idx)}
              >
                {selectedPriceRange === idx && (
                  <div className="w-2 h-2 rounded-full bg-[#1B5E20]" />
                )}
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900">{range.label}</span>
            </label>
          ))}
        </div>
      </CollapsibleSection>

      {/* Availability */}
      <CollapsibleSection title="Disponibilit\u00e9">
        <div className="space-y-2">
          <label className="flex items-center gap-2.5 cursor-pointer group py-0.5">
            <div
              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                inStockOnly
                  ? 'bg-[#1B5E20] border-[#1B5E20]'
                  : 'border-gray-300 dark:border-gray-600 group-hover:border-gray-400'
              }`}
              onClick={() => setInStockOnly(!inStockOnly)}
            >
              {inStockOnly && <Check className="w-2.5 h-2.5 text-white" />}
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 flex items-center gap-1.5">
              <PackageCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
              En stock uniquement
            </span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer group py-0.5">
            <div
              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                onSaleOnly
                  ? 'bg-[#1B5E20] border-[#1B5E20]'
                  : 'border-gray-300 dark:border-gray-600 group-hover:border-gray-400'
              }`}
              onClick={() => setOnSaleOnly(!onSaleOnly)}
            >
              {onSaleOnly && <Check className="w-2.5 h-2.5 text-white" />}
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#FF8F00]" />
              En promotion
            </span>
          </label>
        </div>
      </CollapsibleSection>
    </div>
  );
}

// ============================================================
// Page with Suspense boundary
// ============================================================

export default function RecherchePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#1B5E20] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Chargement...</p>
          </div>
        </div>
      }
    >
      <RechercheContent />
    </Suspense>
  );
}
