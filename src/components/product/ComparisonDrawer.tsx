'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Star, X, Trash2, ArrowUpDown, Loader2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useComparisonStore, type ComparisonProduct } from '@/store/comparison-store'
import { useProductStore, formatPrice } from '@/store/product-store'

interface ComparisonDrawerProps {
  isOpen: boolean
  onClose: () => void
}

interface FullProduct extends ComparisonProduct {
  description: string
  colors: string
  sizes: string | null
  seller: string | null
  sellerVerified: boolean
  isFeatured: boolean
  isOfficial: boolean
  salesCount: number
  createdAt: string
}

function parseSpecs(specsStr: string): { key: string; value: string }[] {
  try {
    const parsed = JSON.parse(specsStr)
    if (Array.isArray(parsed)) {
      return parsed.map((spec: Record<string, string>) => ({
        key: spec.key || spec.name || '',
        value: spec.value || '',
      }))
    }
  } catch { /* ignore */ }
  return []
}

function parseImages(imagesStr: string): string[] {
  try {
    const parsed = JSON.parse(imagesStr)
    if (Array.isArray(parsed)) return parsed
  } catch { /* ignore */ }
  return []
}

export default function ComparisonDrawer({ isOpen, onClose }: ComparisonDrawerProps) {
  const { products, removeProduct, clearComparison } = useComparisonStore()
  const selectedCurrency = useProductStore((s) => s.selectedCurrency)
  const [fullProducts, setFullProducts] = useState<FullProduct[]>([])
  const [loading, setLoading] = useState(false)

  const fetchProducts = useCallback(async () => {
    if (products.length === 0) {
      setFullProducts([])
      return
    }
    setLoading(true)
    try {
      const ids = products.map((p) => p.id).join(',')
      const res = await fetch(`/api/products/compare?ids=${ids}`)
      if (res.ok) {
        const data = await res.json()
        setFullProducts(data.products || [])
      }
    } catch { /* ignore */ }
    setLoading(false)
  }, [products])

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchProducts()
    }
  }, [isOpen, fetchProducts])

  const handleRemove = useCallback((id: string) => {
    removeProduct(id)
  }, [removeProduct])

  const handleClear = useCallback(() => {
    clearComparison()
    setFullProducts([])
  }, [clearComparison])

  const handleSheetClose = useCallback(() => {
    onClose()
  }, [onClose])

  // Determine best values for highlighting
  const bestPrice = fullProducts.length > 1
    ? Math.min(...fullProducts.map((p) => p.priceGNF))
    : -1
  const bestRating = fullProducts.length > 1
    ? Math.max(...fullProducts.map((p) => p.rating))
    : -1
  const worstStock = fullProducts.length > 1
    ? Math.min(...fullProducts.map((p) => p.stock))
    : -1

  // Gather all unique spec keys
  const allSpecKeys: string[] = []
  const seenKeys = new Set<string>()
  fullProducts.forEach((p) => {
    parseSpecs(p.specifications).forEach((spec) => {
      if (spec.key && !seenKeys.has(spec.key)) {
        seenKeys.add(spec.key)
        allSpecKeys.push(spec.key)
      }
    })
  })

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) handleSheetClose() }}>
      <SheetContent side="right" className="w-full sm:max-w-[90vw] lg:max-w-[85vw] p-0 overflow-hidden">
        <SheetHeader className="px-6 pt-6 pb-4 border-b dark:border-gray-700">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-lg">
              <ArrowUpDown className="h-5 w-5 text-[#1B5E20]" />
              Comparaison de produits
              {products.length > 0 && (
                <Badge variant="secondary" className="bg-[#E8F5E9] text-[#1B5E20] ml-1">
                  {products.length}/4
                </Badge>
              )}
            </SheetTitle>
            <div className="flex items-center gap-2">
              {products.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Tout vider
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={handleSheetClose} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="overflow-auto h-[calc(100vh-80px)]">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 text-[#1B5E20] animate-spin" />
            </div>
          ) : fullProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <ArrowUpDown className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Ajoutez des produits a comparer
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                Cliquez sur l&apos;icone de comparaison sur les fiches produits pour ajouter jusqu&apos;a 4 produits, puis revenez ici pour les comparer cote a cote.
              </p>
            </div>
          ) : (
            <div className="min-w-[600px]">
              {/* Product headers */}
              <div className="flex border-b">
                <div className="w-[180px] shrink-0 p-4 bg-gray-50 dark:bg-gray-900" />
                {fullProducts.map((product) => {
                  const img = parseImages(product.images)[0] || '/product-images/headphones-main.png'
                  return (
                    <div key={product.id} className="flex-1 p-4 border-l dark:border-gray-700 text-center relative group">
                      <button
                        onClick={() => handleRemove(product.id)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Retirer"
                      >
                        <X className="h-3 w-3 text-gray-500 dark:text-gray-400 hover:text-red-500" />
                      </button>
                      <Link href={`/produit/${product.slug}`} className="block">
                        <img
                          src={img}
                          alt={product.name}
                          className="w-full aspect-square object-contain mx-auto mb-2 max-h-[140px]"
                        />
                        <p className="text-xs text-[#444] dark:text-gray-300 font-medium uppercase">{product.brand}</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">
                          {product.name}
                        </p>
                      </Link>
                    </div>
                  )
                })}
              </div>

              {/* Price row */}
              <div className="flex border-b">
                <div className="w-[180px] shrink-0 p-3 bg-gray-50 dark:bg-gray-900 text-xs font-medium text-gray-700 dark:text-gray-300">
                  Prix
                </div>
                {fullProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`flex-1 p-3 border-l dark:border-gray-700 text-center ${
                      product.priceGNF === bestPrice ? 'bg-green-50 dark:bg-green-900/30' : ''
                    }`}
                  >
                    <p className={`text-base font-bold ${product.priceGNF === bestPrice ? 'text-green-700' : 'text-[#B12704]'}`}>
                      {formatPrice(product.priceGNF, selectedCurrency)}
                    </p>
                    {product.originalPriceGNF && (
                      <p className="text-xs text-gray-400 line-through">
                        {formatPrice(product.originalPriceGNF, selectedCurrency)}
                      </p>
                    )}
                    {product.priceGNF === bestPrice && fullProducts.length > 1 && (
                      <Badge className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 border-0 text-[9px] mt-1">
                        Meilleur prix
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              {/* Rating row */}
              <div className="flex border-b">
                <div className="w-[180px] shrink-0 p-3 bg-gray-50 dark:bg-gray-900 text-xs font-medium text-gray-700 dark:text-gray-300">
                  Note
                </div>
                {fullProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`flex-1 p-3 border-l dark:border-gray-700 text-center ${
                      product.rating === bestRating && fullProducts.length > 1 ? 'bg-amber-50 dark:bg-amber-900/30' : ''
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <Star className={`h-3.5 w-3.5 ${product.rating === bestRating && fullProducts.length > 1 ? 'text-amber-500 fill-amber-500' : 'text-[#FF8F00] fill-[#FF8F00]'}`} />
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{product.rating}</span>
                      <span className="text-xs text-gray-400">({product.ratingCount})</span>
                    </div>
                    {product.rating === bestRating && fullProducts.length > 1 && (
                      <Badge className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 border-0 text-[9px] mt-1">
                        Meilleure note
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              {/* Stock row */}
              <div className="flex border-b">
                <div className="w-[180px] shrink-0 p-3 bg-gray-50 dark:bg-gray-900 text-xs font-medium text-gray-700 dark:text-gray-300">
                  Stock
                </div>
                {fullProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`flex-1 p-3 border-l dark:border-gray-700 text-center ${
                      product.stock === worstStock && product.stock <= 10 && fullProducts.length > 1 ? 'bg-red-50 dark:bg-red-900/30' : ''
                    }`}
                  >
                    <span className={`text-sm font-medium ${product.stock > 0 ? 'text-[#2E7D32]' : 'text-[#CC0C39]'}`}>
                      {product.stock > 0 ? `${product.stock} disponibles` : 'Rupture'}
                    </span>
                    {product.stock === worstStock && product.stock <= 10 && fullProducts.length > 1 && (
                      <Badge className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 border-0 text-[9px] mt-1">
                        Stock faible
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              {/* Category row */}
              <div className="flex border-b">
                <div className="w-[180px] shrink-0 p-3 bg-gray-50 dark:bg-gray-900 text-xs font-medium text-gray-700 dark:text-gray-300">
                  Categorie
                </div>
                {fullProducts.map((product) => (
                  <div key={product.id} className="flex-1 p-3 border-l dark:border-gray-700 text-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{product.category.name}</span>
                  </div>
                ))}
              </div>

              {/* Brand row */}
              <div className="flex border-b">
                <div className="w-[180px] shrink-0 p-3 bg-gray-50 dark:bg-gray-900 text-xs font-medium text-gray-700 dark:text-gray-300">
                  Marque
                </div>
                {fullProducts.map((product) => (
                  <div key={product.id} className="flex-1 p-3 border-l dark:border-gray-700 text-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{product.brand}</span>
                  </div>
                ))}
              </div>

              {/* Official seller */}
              <div className="flex border-b">
                <div className="w-[180px] shrink-0 p-3 bg-gray-50 dark:bg-gray-900 text-xs font-medium text-gray-700 dark:text-gray-300">
                  Vendeur
                </div>
                {fullProducts.map((product) => (
                  <div key={product.id} className="flex-1 p-3 border-l dark:border-gray-700 text-center">
                    <span className="text-xs text-gray-700 dark:text-gray-300">{product.seller || '—'}</span>
                    {product.sellerVerified && (
                      <Badge className="bg-[#E8F5E9] text-[#1B5E20] border-0 text-[9px] ml-1">
                        Verifie
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              {/* Specifications */}
              {allSpecKeys.length > 0 && (
                <>
                  <div className="p-3 bg-[#1B5E20] text-white text-xs font-semibold uppercase tracking-wider">
                    Caracteristiques techniques
                  </div>
                  {allSpecKeys.map((key) => (
                    <div key={key} className="flex border-b last:border-b-0">
                      <div className="w-[180px] shrink-0 p-3 bg-gray-50 dark:bg-gray-900 text-xs font-medium text-gray-700 dark:text-gray-300">
                        {key}
                      </div>
                      {fullProducts.map((product) => {
                        const specs = parseSpecs(product.specifications)
                        const spec = specs.find((s) => s.key === key)
                        return (
                          <div key={product.id} className="flex-1 p-3 border-l dark:border-gray-700">
                            <span className="text-sm text-gray-900 dark:text-gray-100">{spec?.value || '—'}</span>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
