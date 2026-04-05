'use client'

import { useState, useCallback } from 'react'
import { ArrowUpDown, X, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useComparisonStore } from '@/store/comparison-store'

interface ComparisonBarProps {
  onCompare: () => void
}

function parseImages(imagesStr: string): string[] {
  try {
    const parsed = JSON.parse(imagesStr)
    if (Array.isArray(parsed)) return parsed
  } catch { /* ignore */ }
  return []
}

export default function ComparisonBar({ onCompare }: ComparisonBarProps) {
  const { products, clearComparison } = useComparisonStore()
  const [isVisible, setIsVisible] = useState(false)

  // Show bar when 2+ products are in comparison
  const shouldShow = products.length >= 2

  const handleClose = useCallback(() => {
    setIsVisible(false)
  }, [])

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    clearComparison()
  }, [clearComparison])

  const handleCompare = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onCompare()
  }, [onCompare])

  // Animation: track visibility
  if (shouldShow && !isVisible) {
    // Use setTimeout to trigger animation
    setTimeout(() => setIsVisible(true), 0)
  } else if (!shouldShow && isVisible) {
    setTimeout(() => setIsVisible(false), 0)
  }

  if (!shouldShow) return null

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ease-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="border-t border-gray-200 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.1)]">
        <div className="mx-auto max-w-[1500px] px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Product thumbnails */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {products.map((product) => {
                const img = parseImages(product.images)[0] || '/product-images/headphones-main.png'
                return (
                  <div
                    key={product.id}
                    className="shrink-0 flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg pr-2 pl-1 py-1 border border-gray-200 dark:border-gray-700"
                  >
                    <img
                      src={img}
                      alt={product.name}
                      className="w-8 h-8 rounded object-contain bg-white p-0.5"
                    />
                    <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 max-w-[80px] truncate hidden sm:block">
                      {product.name}
                    </span>
                  </div>
                )
              })}
              <Badge variant="secondary" className="bg-[#E8F5E9] text-[#1B5E20] shrink-0">
                {products.length}/4
              </Badge>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-xs text-gray-500 hover:text-red-500 h-8 px-2 hidden sm:flex"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Vider
              </Button>
              <Button
                onClick={handleCompare}
                className="bg-[#1B5E20] hover:bg-[#145218] text-white h-9 text-sm font-semibold"
              >
                <ArrowUpDown className="h-4 w-4 mr-1.5" />
                Comparer ({products.length})
              </Button>
              <button
                onClick={handleClose}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
                aria-label="Fermer"
              >
                <X className="h-3.5 w-3.5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
