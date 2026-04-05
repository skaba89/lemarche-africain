import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ============================================================
// Recently Viewed State
// ============================================================

interface RecentlyViewedState {
  recentlyViewed: string[];

  // Actions
  addView: (slug: string) => void;
  clearHistory: () => void;
}

// ============================================================
// Constants
// ============================================================

const MAX_ITEMS = 20;

// ============================================================
// Store with localStorage persistence
// ============================================================

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      recentlyViewed: [],

      addView: (slug: string) => {
        const { recentlyViewed } = get();

        // If already exists, move to front (remove old entry, add to front)
        const filtered = recentlyViewed.filter((s) => s !== slug);
        const updated = [slug, ...filtered].slice(0, MAX_ITEMS);

        set({ recentlyViewed: updated });
      },

      clearHistory: () => {
        set({ recentlyViewed: [] });
      },
    }),
    {
      name: 'le-marche-recently-viewed',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') return localStorage;
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({ recentlyViewed: state.recentlyViewed }),
    }
  )
);
