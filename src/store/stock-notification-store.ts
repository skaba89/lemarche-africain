import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface StockNotification {
  productId: string
  productSlug: string
  productName: string
  email: string
  createdAt: string
}

interface StockNotificationState {
  notifications: StockNotification[]
  addNotification: (n: Omit<StockNotification, 'createdAt'>) => void
  removeNotification: (productId: string) => void
  hasNotification: (productId: string) => boolean
}

export const useStockNotificationStore = create<StockNotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      addNotification: (n) => {
        const existing = get().notifications.find(
          (notif) => notif.productId === n.productId && notif.email === n.email
        )
        if (existing) return
        set({
          notifications: [
            ...get().notifications,
            { ...n, createdAt: new Date().toISOString() },
          ],
        })
      },
      removeNotification: (productId) => {
        set({
          notifications: get().notifications.filter((n) => n.productId !== productId),
        })
      },
      hasNotification: (productId) => {
        return get().notifications.some((n) => n.productId === productId)
      },
    }),
    {
      name: 'le-marche-stock-notifications',
    }
  )
)
