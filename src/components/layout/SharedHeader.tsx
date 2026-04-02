'use client';

import Link from 'next/link';
import { ShoppingCart, Search, MapPin, User, Menu, MessageCircle, Phone, X, Zap, Store, Check, Banknote } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useProductStore } from '@/store/product-store';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { CountrySelector } from '@/components/product/SocialProof';
import { ThemeToggle } from '@/components/theme-toggle';
import SearchAutocomplete from '@/components/SearchAutocomplete';

export default function SharedHeader() {
  const { selectedCountry, selectedCurrency } = useProductStore();
  const cartItemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const authUser = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const mobileMenuRef = useRef<HTMLElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        mobileMenuButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Focus trap inside mobile menu
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const menu = document.getElementById('mobile-menu');
    if (!menu) return;

    const focusable = menu.querySelectorAll<HTMLElement>(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length > 0) focusable[0].focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    menu.addEventListener('keydown', handleTab);
    return () => menu.removeEventListener('keydown', handleTab);
  }, [mobileMenuOpen]);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAutocomplete(false);
    if (searchQuery.trim()) {
      router.push(`/recherche?q=${encodeURIComponent(searchQuery.trim())}${selectedCategory ? `&category=${selectedCategory}` : ''}`);
      setMobileMenuOpen(false);
    }
  };

  const handleSuggestionSelect = useCallback((slug: string) => {
    setShowAutocomplete(false);
    setSearchQuery('');
  }, []);

  const handleAutocompleteClose = useCallback(() => {
    setShowAutocomplete(false);
  }, []);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value) {
      router.push(`/recherche?category=${value}`);
      setSelectedCategory('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <header role="banner" className="sticky top-0 z-40 border-b border-[#E65100]/20 bg-[#1B5E20]">
      <div className="mx-auto flex h-14 max-w-[1500px] items-center gap-3 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
            <Store className="h-5 w-5 text-white" />
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="text-sm font-bold text-white tracking-tight">Le <span className="text-[#FF8F00]">March&eacute;</span> Africain</span>
            <span className="text-[8px] text-[#B9F6CA] tracking-widest">{selectedCountry.flag} {selectedCountry.name.toUpperCase()}</span>
          </div>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} id="header-search" aria-label="Rechercher des produits" className="relative flex flex-1 items-center rounded-lg overflow-visible">
          <select
            className="hidden h-10 border-none bg-[#2E7D32] px-2 text-xs text-white outline-none sm:block rounded-l-lg"
            id="header-category-select"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <option value="">Toutes</option>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
          <input
            type="text"
            id="header-search-input"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowAutocomplete(true); }}
            onFocus={() => { if (searchQuery) setShowAutocomplete(true); }}
            placeholder="Rechercher sur Le March&eacute; Africain..."
            className="h-10 flex-1 border-none bg-white px-3 text-sm text-[#0F1111] outline-none placeholder:text-[#999]"
            autoComplete="off"
          />
          <button type="submit" className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#FF8F00] hover:bg-[#F57C00] transition-colors">
            <Search className="h-5 w-5 text-white" />
          </button>
          {showAutocomplete && searchQuery && (
            <SearchAutocomplete
              value={searchQuery}
              onChange={setSearchQuery}
              onSelect={handleSuggestionSelect}
              onClose={handleAutocompleteClose}
            />
          )}
        </form>

        {/* Right actions */}
        <nav aria-label="Navigation principale" className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <CountrySelector />
          <Link href="/compte" className="flex flex-col items-start text-xs text-white hover:text-[#B9F6CA] transition-colors">
            <span className="text-[10px] text-[#B9F6CA]">Compte</span>
            <span className="flex items-center gap-0.5 font-medium">
              <User className="h-3.5 w-3.5" />
              {isAuthenticated && authUser?.name && (
                <span className="max-w-[80px] truncate">{authUser.name.split(' ')[0]}</span>
              )}
            </span>
          </Link>
          <button className="flex flex-col items-start text-xs text-white hover:text-[#B9F6CA] transition-colors">
            <span className="text-[10px] text-[#B9F6CA]">Livrer &agrave;</span>
            <span className="flex items-center gap-0.5 font-medium"><MapPin className="h-3.5 w-3.5" />{selectedCountry.capital}</span>
          </button>
          <Link href="/panier" className="relative flex items-center gap-1 text-white hover:text-[#B9F6CA] transition-colors">
            <ShoppingCart className="h-6 w-6" />
            <span className="font-medium text-sm">Panier</span>
            {cartItemCount > 0 && (
              <span className="absolute -right-2 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF8F00] text-xs font-bold text-white">{cartItemCount}</span>
            )}
          </Link>
        </nav>

        {/* Mobile menu */}
        <button ref={mobileMenuButtonRef} className="flex items-center md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-expanded={mobileMenuOpen} aria-controls="mobile-menu" aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}>
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <nav id="mobile-menu" role="navigation" aria-label="Menu mobile" className="border-t border-white/10 bg-[#2E7D32] p-4 md:hidden space-y-1">
          <div className="mb-3">
            <div className="flex items-center justify-between">
              <CountrySelector />
              <ThemeToggle />
            </div>
          </div>
          <Link href="/compte" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-2.5 text-sm text-white">
            <User className="h-4 w-4" /> {isAuthenticated && authUser?.name ? authUser.name : 'Mon Compte'}
          </Link>
          <Link href="/panier" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-2.5 text-sm text-white"><ShoppingCart className="h-4 w-4" /> Panier ({cartItemCount})</Link>
          <Link href="/aide" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-2.5 text-sm text-white"><MessageCircle className="h-4 w-4" /> Centre d&apos;Aide</Link>
          <Link href="/compte#commandes" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-2.5 text-sm text-white"><Check className="h-4 w-4" /> Mes Commandes</Link>
          <a href="https://wa.me/224628000000" target="_blank" rel="noopener" className="flex items-center gap-2 py-2.5 text-sm text-white"><Phone className="h-4 w-4" /> +224 628 00 00 00</a>
        </nav>
      )}

      {/* Promo bar */}
      <div className="bg-[#FF8F00] px-4 py-1.5 text-center overflow-hidden">
        <div className="flex items-center justify-center gap-3 text-xs font-medium text-white whitespace-nowrap">
          <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> VENTE FLASH</span>
          <span>&bull;</span>
          <span>-35% &Eacute;lectronique</span>
          <span>&bull;</span>
          <span>Livraison gratuite</span>
          <span>&bull;</span>
          <span>3&times; sans frais {selectedCurrency}</span>
        </div>
      </div>
    </header>
  );
}
