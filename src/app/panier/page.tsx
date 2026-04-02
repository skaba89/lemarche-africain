'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  Tag,
  Truck,
  Shield,
  ChevronRight,
  CreditCard,
  Banknote,
  X,
  Check,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useCartStore, getCartSubtotalGNF, getCartSavingsGNF, getCartItemCount } from '@/store/cart-store';
import { useProductStore, formatPrice } from '@/store/product-store';
import { PAYMENT_METHODS, getDeliveryFee } from '@/lib/constants';

// ============================================================
// Cart Page
// ============================================================

export default function PanierPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const selectedCurrency = useProductStore((s) => s.selectedCurrency);
  const deliveryType = useProductStore((s) => s.deliveryType);
  const paymentMethod = useProductStore((s) => s.paymentMethod);
  const setPaymentMethod = useProductStore((s) => s.setPaymentMethod);

  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLabel, setCouponLabel] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [showCouponInput, setShowCouponInput] = useState(false);

  const subtotal = useMemo(() => getCartSubtotalGNF(items), [items]);
  const savings = useMemo(() => getCartSavingsGNF(items), [items]);
  const itemCount = useMemo(() => getCartItemCount(items), [items]);
  const deliveryFee = getDeliveryFee(subtotal, deliveryType);
  const total = Math.max(0, subtotal - couponDiscount + deliveryFee);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), subtotalGNF: subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setCouponApplied(true);
        setCouponDiscount(data.discount);
        setCouponLabel(data.label || couponCode.trim().toUpperCase());
        setCouponError('');
      } else {
        setCouponApplied(false);
        setCouponDiscount(0);
        setCouponLabel('');
        setCouponError(data.error || 'Code promo invalide');
      }
    } catch {
      setCouponError('Erreur lors de la validation du code');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponApplied(false);
    setCouponDiscount(0);
    setCouponLabel('');
    setCouponCode('');
    setCouponError('');
  };

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="min-h-[40vh]">
        <div className="flex flex-col items-center justify-center py-24 px-4">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
            <ShoppingCart className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Votre panier est vide</h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-8 max-w-sm">
            Vous n&apos;avez pas encore ajout&eacute; d&apos;articles &agrave; votre panier. Parcourez nos produits et trouvez ce qui vous pla&icirc;t !
          </p>
          <Link href="/">
            <Button className="bg-[#1B5E20] hover:bg-[#145218] text-white px-8 py-6 text-base rounded-lg font-semibold">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Continuer vos achats
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[40vh]">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Mon Panier</h1>
          <span className="text-sm text-gray-500 dark:text-gray-400">{itemCount} article{itemCount > 1 ? 's' : ''}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {/* Free delivery banner */}
            {subtotal > 0 && subtotal < 5000000 && (
              <div className="bg-gradient-to-r from-[#E8F5E9] to-[#F1F8E9] border border-[#2E7D32]/20 rounded-lg p-3 flex items-center gap-3">
                <Truck className="w-5 h-5 text-[#2E7D32] shrink-0" />
                <p className="text-sm text-[#2E7D32]">
                  Plus que <span className="font-bold">{formatPrice(5000000 - subtotal, selectedCurrency)}</span> pour la livraison gratuite !
                </p>
              </div>
            )}
            {subtotal >= 5000000 && (
              <div className="bg-gradient-to-r from-[#E8F5E9] to-[#C8E6C9] border border-[#2E7D32]/30 rounded-lg p-3 flex items-center gap-3">
                <Truck className="w-5 h-5 text-[#2E7D32] shrink-0" />
                <p className="text-sm text-[#2E7D32] font-semibold">
                  <Check className="w-4 h-4 text-[#2E7D32] inline" /> Livraison GRATUITE ! Vous avez b&eacute;n&eacute;fici&eacute; de la livraison offerte.
                </p>
              </div>
            )}

            {/* Items */}
            <AnimatePresence mode="popLayout">
            {items.map((item) => {
              const lineTotal = item.priceGNF * item.quantity;
              const lineOriginalTotal = item.originalPriceGNF * item.quantity;
              const lineSavings = lineOriginalTotal - lineTotal;
              const itemDiscount = Math.round(((item.originalPriceGNF - item.priceGNF) / item.originalPriceGNF) * 100);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm overflow-hidden"
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <Link href={`/produit/${item.productSlug || item.productId}`} className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ShoppingCart className="w-8 h-8 text-gray-300" />
                      )}
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 mb-1">
                        {item.productName}
                      </h3>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
                        <span className="inline-flex items-center gap-1">
                          <span
                            className="w-3 h-3 rounded-full border border-gray-300 inline-block"
                            style={{ backgroundColor: item.color }}
                          />
                          {item.colorLabel}
                        </span>
                        <span>Taille : {item.sizeLabel}</span>
                      </div>

                      {/* Price */}
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-base font-bold text-[#B12704]">
                          {formatPrice(lineTotal, selectedCurrency)}
                        </span>
                        {lineSavings > 0 && (
                          <>
                            <span className="text-xs text-gray-400 line-through">
                              {formatPrice(lineOriginalTotal, selectedCurrency)}
                            </span>
                            <span className="text-xs font-semibold text-[#FF8F00] bg-[#FFF3E0] px-1.5 py-0.5 rounded">
                              -{itemDiscount}%
                            </span>
                          </>
                        )}
                      </div>

                      {/* Unit price */}
                      <p className="text-xs text-gray-500 mb-3">
                        Prix unitaire :{' '}
                        <span className="text-[#B12704] font-medium">
                          {formatPrice(item.priceGNF, selectedCurrency)}
                        </span>
                        {item.originalPriceGNF > item.priceGNF && (
                          <span className="text-gray-400 line-through ml-1">
                            {formatPrice(item.originalPriceGNF, selectedCurrency)}
                          </span>
                        )}
                      </p>

                      {/* Quantity controls + remove */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-10 h-8 flex items-center justify-center text-sm font-semibold border-x border-gray-300 bg-gray-50">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          {lineSavings > 0 && (
                            <span className="text-xs font-medium text-[#2E7D32]">
                              Vous &eacute;conomisez {formatPrice(lineSavings, selectedCurrency)}
                            </span>
                          )}
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-[#B12704] transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <Link
                href="/"
                className="flex items-center gap-2 text-sm text-[#1B5E20] hover:underline"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Continuer vos achats
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (!window.confirm('Voulez-vous vraiment vider votre panier ?')) return;
                  clearCart();
                }}
                className="text-[#B12704] hover:text-[#8B1A03] hover:bg-red-50 text-xs"
              >
                Vider le panier
              </Button>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm sticky top-[140px]">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
                R&eacute;sum&eacute; de la commande
              </h2>

              {/* Subtotal */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Sous-total ({itemCount} article{itemCount > 1 ? 's' : ''})</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{formatPrice(subtotal, selectedCurrency)}</span>
                </div>

                {savings > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#2E7D32]">&Eacute;conomies</span>
                    <span className="font-medium text-[#2E7D32]">-{formatPrice(savings, selectedCurrency)}</span>
                  </div>
                )}

                {/* Coupon */}
                {couponApplied && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#FF8F00]">{couponLabel}</span>
                    <span className="font-medium text-[#FF8F00]">-{formatPrice(couponDiscount, selectedCurrency)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Livraison</span>
                  <span className={deliveryFee === 0 ? 'font-medium text-[#2E7D32]' : 'font-medium text-gray-900'}>
                    {deliveryFee === 0 ? 'GRATUITE' : formatPrice(deliveryFee, selectedCurrency)}
                  </span>
                </div>
              </div>

              <Separator className="my-3" />

              {/* Total */}
              <div className="flex justify-between items-baseline mb-5">
                <span className="text-base font-semibold text-gray-900 dark:text-gray-100">Total</span>
                <span className="text-xl font-bold text-[#B12704]">{formatPrice(total, selectedCurrency)}</span>
              </div>

              {/* Coupon Input */}
              <div className="mb-5">
                {!showCouponInput ? (
                  <button
                    onClick={() => setShowCouponInput(true)}
                    className="flex items-center gap-2 text-sm text-[#1B5E20] hover:underline"
                  >
                    <Tag className="w-4 h-4" />
                    {couponApplied ? 'Code promo appliqu&eacute;' : 'Ajouter un code promo'}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Code promo"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          setCouponError('');
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                        className="text-sm h-9"
                      />
                      {couponApplied ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={removeCoupon}
                          className="h-9 text-xs"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Retirer
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={applyCoupon}
                          disabled={couponLoading}
                          className="h-9 bg-[#FF8F00] hover:bg-[#E68100] text-white text-xs"
                        >
                          {couponLoading ? '...' : 'Appliquer'}
                        </Button>
                      )}
                    </div>
                    {couponError && (
                      <p className="text-xs text-[#B12704]">{couponError}</p>
                    )}
                    {couponApplied && (
                      <p className="text-xs text-[#2E7D32] font-medium">
                        <Check className="w-3 h-3 text-[#2E7D32] mr-1 inline" /> Code {couponLabel} appliqu&eacute; ! -{formatPrice(couponDiscount, selectedCurrency)}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Payment Method Selection */}
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#1B5E20]" />
                  Mode de paiement
                </h3>
                <div className="space-y-2">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as Parameters<typeof setPaymentMethod>[0])}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                        paymentMethod === method.id
                          ? 'border-[#1B5E20] bg-[#E8F5E9] ring-1 ring-[#1B5E20]/20'
                          : 'border-gray-200 hover:border-gray-300 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <span className="mr-1"><div className={`h-4 w-4 rounded-full ${method.iconColor} inline-block`} /></span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{method.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{method.desc}</p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === method.id
                            ? 'border-[#1B5E20]'
                            : 'border-gray-300'
                        }`}
                      >
                        {paymentMethod === method.id && (
                          <div className="w-2 h-2 rounded-full bg-[#1B5E20]" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Separator className="my-4" />

              {/* Checkout Button */}
              <Button onClick={() => router.push('/commande')} className="w-full bg-[#1B5E20] hover:bg-[#145218] text-white py-6 text-base font-semibold rounded-lg">
                <Shield className="w-4 h-4 mr-2" />
                Passer la commande
              </Button>

              {/* Trust badges */}
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Shield className="w-3.5 h-3.5 text-[#2E7D32]" />
                  <span>Paiement 100% s&eacute;curis&eacute;</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Truck className="w-3.5 h-3.5 text-[#2E7D32]" />
                  <span>Livraison fiable en Guin&eacute;e</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Banknote className="w-3.5 h-3.5 text-[#2E7D32]" />
                  <span>Retrait gratuit au point de retrait</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
