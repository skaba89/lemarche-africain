'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Loader2, TrendingUp, ArrowRight } from 'lucide-react';
import { useProductStore, formatPrice } from '@/store/product-store';

interface Suggestion {
  slug: string;
  name: string;
  brand: string;
  priceGNF: number;
  image: string | null;
  categoryName: string;
}

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (slug: string) => void;
  onClose: () => void;
}

function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="font-bold text-gray-900 dark:text-gray-100">
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function SearchAutocomplete({
  value,
  onChange,
  onSelect,
  onClose,
}: SearchAutocompleteProps) {
  const router = useRouter();
  const selectedCurrency = useProductStore((s) => s.selectedCurrency);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const itemsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  // Fetch suggestions with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value || value.length < 1) {
      setSuggestions([]);
      setVisible(false);
      setActiveIndex(-1);
      return;
    }

    setVisible(true);
    setLoading(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(value)}`);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        setActiveIndex(-1);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setVisible(false);
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setVisible(false);
        onClose();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        const slug = suggestions[activeIndex]?.slug;
        if (slug) {
          setVisible(false);
          onSelect(slug);
          router.push(`/produit/${slug}`);
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [visible, suggestions, activeIndex, onClose, onSelect, router]);

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && itemsRef.current[activeIndex]) {
      itemsRef.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const handleSuggestionClick = useCallback(
    (slug: string) => {
      setVisible(false);
      onSelect(slug);
      router.push(`/produit/${slug}`);
    },
    [onSelect, router]
  );

  const handleSeeAll = useCallback(() => {
    setVisible(false);
    if (value.trim()) {
      router.push(`/recherche?q=${encodeURIComponent(value.trim())}`);
    }
  }, [value, router]);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 right-0 z-50 mt-0 bg-white dark:bg-gray-800 shadow-lg rounded-b-lg border border-t-0 border-gray-200 dark:border-gray-700"
    >
      <div className="max-h-80 overflow-y-auto">
        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-[#1B5E20]" />
            <span className="ml-2 text-sm text-gray-500">Recherche en cours...</span>
          </div>
        )}

        {/* No results */}
        {!loading && value.length >= 1 && suggestions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-gray-400">
            <Search className="h-6 w-6 mb-2" />
            <p className="text-sm">Aucun r&eacute;sultat</p>
          </div>
        )}

        {/* Suggestions list */}
        {!loading && suggestions.length > 0 && (
          <ul className="py-1" role="listbox">
            {suggestions.map((item, idx) => (
              <li key={item.slug} role="option" aria-selected={idx === activeIndex}>
                <a
                  ref={(el) => { itemsRef.current[idx] = el; }}
                  href={`/produit/${item.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSuggestionClick(item.slug);
                  }}
                  className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                    idx === activeIndex
                      ? 'bg-[#E8F5E9] dark:bg-[#1B5E20]/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1">
                      {highlightMatch(item.name, value)}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <span>{item.brand}</span>
                      <span className="text-gray-300 dark:text-gray-600">&bull;</span>
                      <span>{item.categoryName}</span>
                    </p>
                  </div>
                  {/* Price */}
                  <span className="text-sm font-bold text-[#B12704] shrink-0">
                    {formatPrice(item.priceGNF, selectedCurrency)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* See all results */}
      {!loading && suggestions.length > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={handleSeeAll}
            className="flex items-center justify-center w-full gap-2 px-4 py-3 text-sm text-[#1B5E20] hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors font-medium"
          >
            Voir tous les r&eacute;sultats
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
