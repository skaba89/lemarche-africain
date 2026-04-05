'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Trash2, Minus, Plus, ShoppingBag, ArrowRight, X } from 'lucide-react';
import { useCartStore, getCartSubtotalGNF, getCartSavingsGNF, getCartItemCount } from '@/store/cart-store';
import { useProductStore, formatPrice } from '@/store/product-store';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export default function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const openCart = useCartStore((s) => s.openCart);
  const closeCart = useCartStore((s) => s.closeCart);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const selectedCurrency = useProductStore((s) => s.selectedCurrency);

  const totalItems = getCartItemCount(items);
  const subtotal = getCartSubtotalGNF(items);
  const savings = getCartSavingsGNF(items);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeCart();
    }
  };

  const handleRemoveItem = (id: string, name: string) => {
    removeItem(id);
    toast.success(`${name} retir\u00e9 du panier`);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 bg-white dark:bg-gray-900 [&>button.absolute]:hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-[#1B5E20] px-4 py-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
              <ShoppingCart className="h-4.5 w-4.5 text-white" />
            </div>
            <SheetTitle className="text-base font-semibold text-white m-0">
              Mon Panier
            </SheetTitle>
            {totalItems > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF8F00] px-1.5 text-xs font-bold text-white">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Fermer le panier"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <SheetDescription className="sr-only">
          Votre panier contient {totalItems} article{totalItems !== 1 ? 's' : ''}
        </SheetDescription>

        {items.length === 0 ? (
          /* Empty state */
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <ShoppingBag className="h-10 w-10 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="text-center space-y-1.5">
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Votre panier est vide
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ajoutez des produits pour commencer vos achats
              </p>
            </div>
            <Button
              asChild
              onClick={closeCart}
              className="mt-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white"
            >
              <Link href="/">
                D\u00e9couvrir nos produits
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Scrollable items list */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 p-4">
                    {/* Product image */}
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.productName}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ShoppingBag className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Item details */}
                    <div className="flex flex-1 flex-col justify-between min-w-0">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                          {item.productName}
                        </p>
                        {(item.colorLabel || item.sizeLabel) && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            {item.colorLabel}
                            {item.colorLabel && item.sizeLabel && ' / '}
                            {item.sizeLabel}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-1.5">
                        {/* Quantity controls */}
                        <div className="flex items-center gap-0 rounded-lg border border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="flex h-7 w-7 items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-l-lg"
                            aria-label="Diminuer la quantit\u00e9"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="flex h-7 w-8 items-center justify-center text-sm font-medium text-gray-900 dark:text-gray-100 border-x border-gray-200 dark:border-gray-700">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="flex h-7 w-7 items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-r-lg"
                            aria-label="Augmenter la quantit\u00e9"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Price + remove */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                            {formatPrice(item.priceGNF, selectedCurrency)}
                          </span>
                          <button
                            onClick={() => handleRemoveItem(item.id, item.productName)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/50 dark:hover:text-red-400 transition-colors"
                            aria-label={`Retirer ${item.productName}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sticky bottom section */}
            <div className="shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div className="px-4 pt-3 pb-4 space-y-3">
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Sous-total ({totalItems} article{totalItems !== 1 ? 's' : ''})
                  </span>
                  <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {formatPrice(subtotal, selectedCurrency)}
                  </span>
                </div>

                {/* Savings */}
                {savings > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-emerald-600 dark:text-emerald-400">
                      Vous \u00e9conomisez
                    </span>
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      -{formatPrice(savings, selectedCurrency)}
                    </span>
                  </div>
                )}

                <Separator className="bg-gray-200 dark:bg-gray-700" />

                {/* Action buttons */}
                <div className="flex flex-col gap-2">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-[#1B5E20] text-[#1B5E20] hover:bg-[#1B5E20]/5 dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-400/10 font-medium"
                    onClick={closeCart}
                  >
                    <Link href="/panier">
                      Voir le panier complet
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-semibold"
                    onClick={closeCart}
                  >
                    <Link href="/commande">
                      Commander
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
