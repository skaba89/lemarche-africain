import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { formatPrice } from "@/store/product-store";
import type { Currency } from "@/store/product-store";

// ============================================================
// Cart Item
// ============================================================

export interface CartItem {
  id: string;
  productId: string;
  productSlug?: string;
  productName: string;
  image: string;
  color: string;
  colorLabel: string;
  size: string;
  sizeLabel: string;
  priceGNF: number;
  originalPriceGNF: number;
  quantity: number;
  stock: number;
}

// ============================================================
// Cart State
// ============================================================

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

// ============================================================
// Helpers
// ============================================================

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ============================================================
// Store with localStorage persistence
// ============================================================

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item: Omit<CartItem, "id">) => {
        const { items } = get();

        // Check if an identical item already exists (same product + color + size)
        const existingIndex = items.findIndex(
          (i) =>
            i.productId === item.productId &&
            i.color === item.color &&
            i.size === item.size
        );

        if (existingIndex >= 0) {
          // Update quantity of existing item
          const updated = [...items];
          const existing = updated[existingIndex];
          const newQty = Math.min(existing.quantity + item.quantity, existing.stock);
          updated[existingIndex] = { ...existing, quantity: newQty };
          set({ items: updated });
        } else {
          // Add new item
          const newItem: CartItem = { ...item, id: generateId() };
          set({ items: [...items, newItem] });
        }
      },

      removeItem: (id: string) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      updateQuantity: (id: string, quantity: number) => {
        set({
          items: get().items.map((item) => {
            if (item.id !== id) return item;
            const clampedQty = Math.max(1, Math.min(quantity, item.stock));
            return { ...item, quantity: clampedQty };
          }),
        });
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: "le-marche-cart",
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') return localStorage;
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// ============================================================
// Derived getters (use outside components when needed)
// ============================================================

export function getCartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartSubtotalGNF(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.priceGNF * item.quantity, 0);
}

export function getCartSavingsGNF(items: CartItem[]): number {
  return items.reduce(
    (sum, item) => sum + (item.originalPriceGNF - item.priceGNF) * item.quantity,
    0
  );
}

export function formatCartItemPrice(priceGNF: number, currency: Currency): string {
  return formatPrice(priceGNF, currency);
}

// ============================================================
// Re-export formatPrice for convenience
// ============================================================

export { formatPrice };
