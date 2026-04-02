import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ComparisonProduct {
  id: string
  slug: string
  name: string
  brand: string
  priceGNF: number
  originalPriceGNF: number | null
  rating: number
  ratingCount: number
  images: string
  specifications: string
  features: string
  stock: number
  category: { slug: string; name: string }
}

interface ComparisonState {
  products: ComparisonProduct[]
  addProduct: (product: ComparisonProduct) => void
  removeProduct: (id: string) => void
  clearComparison: () => void
  isInComparison: (id: string) => boolean
}

export const useComparisonStore = create<ComparisonState>()(
  persist(
    (set, get) => ({
      products: [],

      addProduct: (product) => {
        const current = get().products
        if (current.length >= 4) return
        if (current.find((p) => p.id === product.id)) return
        set({ products: [...current, product] })
      },

      removeProduct: (id) => {
        set({ products: get().products.filter((p) => p.id !== id) })
      },

      clearComparison: () => {
        set({ products: [] })
      },

      isInComparison: (id) => {
        return get().products.some((p) => p.id === id)
      },
    }),
    {
      name: 'le-marche-comparison',
    }
  )
)
