import { create } from 'zustand'

interface QuickViewState {
  isOpen: boolean
  slug: string | null
  open: (slug: string) => void
  close: () => void
}

export const useQuickViewStore = create<QuickViewState>((set) => ({
  isOpen: false,
  slug: null,
  open: (slug) => set({ isOpen: true, slug }),
  close: () => set({ isOpen: false, slug: null }),
}))
