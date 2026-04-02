'use client';

import { useState, useEffect, useCallback } from 'react';
import { useProductStore, formatPrice } from '@/store/product-store';
import { product } from '@/data/product';
import {
  Heart, MapPin, Truck, Clock, Minus, Plus,
  ShoppingCart, Zap, Shield, RotateCcw, Award,
  HeadphonesIcon, ChevronDown, ChevronUp, Store,
  CreditCard, Banknote, MessageCircle, X, Check,
  Smartphone,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// ============================================================
// Buy Box — Adapté pour la Guinée
// Paiement: Orange Money, MTN MoMo, Cash, Carte
// Livraison: Domicile ou Point de Retrait
// ============================================================

export default function BuyBox() {
  const {
    currentSKU, quantity, setQuantity,
    isWishlisted, toggleWishlist,
    addToCart, addToCartToast, cartCount,
    deliveryType, setDeliveryType,
    selectedPickupPoint, setSelectedPickupPoint,
    paymentMethod, setPaymentMethod,
    showShareMenu, toggleShareMenu,
    selectedCurrency,
  } = useProductStore();

  const router = useRouter();
  const [showGuarantee, setShowGuarantee] = useState(false);
  const [countdown, setCountdown] = useState({ hours: 5, minutes: 23 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        let { hours, minutes } = prev;
        minutes--;
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; minutes = 59; }
        return { hours, minutes };
      });
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleQuantityChange = useCallback(
    (delta: number) => { setQuantity(quantity + delta); },
    [quantity, setQuantity]
  );

  if (!currentSKU) return null;

  const discount = Math.round(
    ((currentSKU.originalPriceGNF - currentSKU.priceGNF) / currentSKU.originalPriceGNF) * 100
  );

  const stockStatus = currentSKU.stock === 0
    ? { text: 'Actuellement en rupture', color: 'text-[#CC0C39]', bg: '' }
    : currentSKU.stock < 5
    ? { text: `Plus que ${currentSKU.stock} en stock — commandez vite !`, color: 'text-[#E65100]', bg: 'bg-[#FFF3E0]' }
    : { text: 'En Stock', color: 'text-[#2E7D32]', bg: '' };

  const deliveryCostGNF = deliveryType === 'pickup' ? 0 : 50000;

  const paymentMethods = [
    { id: 'orange_money' as const, label: 'Orange Money', iconColor: 'bg-[#FF6600]', color: 'border-[#FF6600] bg-[#FFF3E0]' },
    { id: 'mtn_momo' as const, label: 'MTN MoMo', iconColor: 'bg-[#FFC107]', color: 'border-[#FFC107] bg-[#FFF8E1]' },
    { id: 'wave' as const, label: 'Wave', iconColor: 'bg-[#1DA1F2]', color: 'border-[#1DA1F2] bg-[#E3F2FD]' },
    { id: 'cash' as const, label: 'Cash on Delivery', iconColor: 'bg-[#4CAF50]', color: 'border-[#4CAF50] bg-[#E8F5E9]' },
    { id: 'carte' as const, label: 'Carte Bancaire', iconColor: 'bg-[#2196F3]', color: 'border-[#2196F3] bg-[#E3F2FD]' },
  ];

  return (
    <>
      {/* Toast */}
      <div className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-center transition-all duration-300 ${
        addToCartToast ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      }`}>
        <div className="flex items-center gap-2 rounded-lg bg-[#2E7D32] px-6 py-3 text-white shadow-lg">
          <Check className="h-4 w-4" />
          <span className="text-sm font-medium">
            Ajouté au panier — {cartCount} article{cartCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Share Menu */}
      {showShareMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={toggleShareMenu}>
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-[#0F1111]">Partager ce produit</h3>
              <button onClick={toggleShareMenu} className="rounded-full p-1 hover:bg-[#F7F8F8]">
                <X className="h-5 w-5 text-[#565959]" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'WhatsApp', color: 'bg-[#25D366]/10' },
                { label: 'Facebook', color: 'bg-[#1877F2]/10' },
                { label: 'Twitter', color: 'bg-[#1DA1F2]/10' },
                { label: 'SMS', color: 'bg-[#F7F8F8]' },
              ].map((item) => (
                <button key={item.label} className="flex flex-col items-center gap-2">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl ${item.color}`}>
                    {item.label === 'WhatsApp' && <MessageCircle className="h-6 w-6 text-[#25D366]" />}
                    {item.label === 'Facebook' && <div className="h-6 w-6 rounded bg-[#1877F2] flex items-center justify-center"><span className="text-white text-xs font-bold">f</span></div>}
                    {item.label === 'Twitter' && <div className="h-6 w-6 rounded bg-[#1DA1F2] flex items-center justify-center"><span className="text-white text-xs font-bold">X</span></div>}
                    {item.label === 'SMS' && <Smartphone className="h-6 w-6 text-[#565959]" />}
                  </div>
                  <span className="text-xs text-[#565959]">{item.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-4">
              <label className="mb-1 block text-xs text-[#565959]">Lien du produit</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value="https://lemarcheafricain.gn/p/soundcore-pro-x1"
                  className="flex-1 rounded-lg border border-[#DDD] bg-[#F7F8F8] px-3 py-2 text-xs outline-none"
                />
                <button className="rounded-lg bg-[#2E7D32] px-4 py-2 text-xs font-medium text-white hover:bg-[#1B5E20] transition">
                  Copier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Buy Box Card */}
      <div className="rounded-xl border border-[#D5D9D9] bg-white p-5 shadow-sm">
        {/* Price */}
        <div className="mb-4">
          <div className="flex items-baseline gap-1">
            <span className="text-[26px] font-normal text-[#B12704]">{formatPrice(currentSKU.priceGNF, selectedCurrency)}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            {discount > 0 && (
              <span className="text-xs text-[#565959] line-through">{formatPrice(currentSKU.originalPriceGNF, selectedCurrency)}</span>
            )}
            {discount > 0 && (
              <span className="rounded bg-[#CC0C39]/10 px-1.5 py-0.5 text-xs font-medium text-[#CC0C39]">-{discount}%</span>
            )}
          </div>
          {currentSKU.originalPriceGNF > currentSKU.priceGNF && (
            <p className="mt-1 text-xs text-[#2E7D32]">
              Vous économisez {formatPrice(currentSKU.originalPriceGNF - currentSKU.priceGNF, selectedCurrency)}
            </p>
          )}
        </div>

        {/* Delivery Type Selector */}
        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-[#0F1111]">Mode de livraison :</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setDeliveryType('pickup')}
              className={`rounded-lg border-2 p-3 text-left transition ${
                deliveryType === 'pickup'
                  ? 'border-[#2E7D32] bg-[#E8F5E9] text-[#2E7D32]'
                  : 'border-[#DDD] hover:border-[#999] text-[#565959]'
              }`}
            >
              <Store className="h-4 w-4 mb-1" />
              <span className="block text-xs font-medium">Point de Retrait</span>
              <span className="block text-[10px] mt-0.5 opacity-80">Gratuit</span>
            </button>
            <button
              onClick={() => setDeliveryType('domicile')}
              className={`rounded-lg border-2 p-3 text-left transition ${
                deliveryType === 'domicile'
                  ? 'border-[#2E7D32] bg-[#E8F5E9] text-[#2E7D32]'
                  : 'border-[#DDD] hover:border-[#999] text-[#565959]'
              }`}
            >
              <Truck className="h-4 w-4 mb-1" />
              <span className="block text-xs font-medium">Livraison à Domicile</span>
              <span className="block text-[10px] mt-0.5 opacity-80">
                {deliveryType === 'domicile' ? formatPrice(deliveryCostGNF, selectedCurrency) : 'Gratuit'}
              </span>
            </button>
          </div>
        </div>

        {/* Pickup point selector */}
        {deliveryType === 'pickup' && (
          <div className="mb-4">
            <label className="mb-1.5 block text-sm text-[#0F1111]">Point de retrait :</label>
            <select
              value={selectedPickupPoint}
              onChange={(e) => setSelectedPickupPoint(e.target.value)}
              className="w-full rounded-lg border border-[#D5D9D9] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#2E7D32]"
            >
              {product.pickupPoints
                .filter((pp) => pp.isAvailable)
                .map((pp) => (
                  <option key={pp.id} value={pp.id}>
                    {pp.name} — {pp.city} ({pp.hours})
                  </option>
                ))}
            </select>
            <p className="mt-1 text-xs text-[#565959]">
              <MapPin className="h-3.5 w-3.5 text-[#565959] inline" /> {product.pickupPoints.find((pp) => pp.id === selectedPickupPoint)?.address}
            </p>
          </div>
        )}

        {/* Delivery Estimate */}
        <div className="mb-4 flex items-start gap-2">
          <Truck className="mt-0.5 h-4 w-4 shrink-0 text-[#2E7D32]" />
          <div>
            <p className="text-sm font-medium text-[#2E7D32]">
              {currentSKU.deliveryDays === 'Demain'
                ? `Livraison rapide : ${currentSKU.deliveryDate}`
                : `Estimation : ${currentSKU.deliveryDate}`}
            </p>
            {deliveryType === 'domicile' && (
              <p className="mt-0.5 text-xs text-[#565959]">Conakry et environs · Autres villes : +2 à 5 jours</p>
            )}
          </div>
        </div>

        {/* Countdown */}
        {currentSKU.stock > 0 && (
          <div className="mb-4 flex items-center gap-1.5 text-xs">
            <Clock className="h-3.5 w-3.5 text-[#CC0C39]" />
            <span className="text-[#CC0C39] font-medium">
              Commandez dans {countdown.hours}h {countdown.minutes}min
            </span>
          </div>
        )}

        {/* Stock */}
        <div className={`mb-4 rounded-lg px-3 py-2 ${stockStatus.bg}`}>
          <span className={`text-sm font-medium ${stockStatus.color}`}>{stockStatus.text}</span>
        </div>

        {/* Quantity */}
        {currentSKU.stock > 0 && (
          <div className="mb-4">
            <label className="mb-1.5 block text-sm text-[#0F1111]">Quantité :</label>
            <div className="inline-flex items-center rounded-lg border border-[#D5D9D9]">
              <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}
                className="flex h-8 w-8 items-center justify-center text-[#565959] transition hover:bg-[#F7F8F8] disabled:cursor-not-allowed disabled:opacity-40">
                <Minus className="h-3.5 w-3.5" />
              </button>
              <input type="text" value={quantity}
                onChange={(e) => { const val = parseInt(e.target.value); if (!isNaN(val)) setQuantity(val); }}
                onBlur={() => setQuantity(quantity)}
                className="h-8 w-12 border-x border-[#D5D9D9] bg-white text-center text-sm outline-none"
              />
              <button onClick={() => handleQuantityChange(1)} disabled={quantity >= currentSKU.stock}
                className="flex h-8 w-8 items-center justify-center text-[#565959] transition hover:bg-[#F7F8F8] disabled:cursor-not-allowed disabled:opacity-40">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            {quantity > 1 && (
              <p className="mt-1 text-xs text-[#565959]">
                Sous-total : {formatPrice(currentSKU.priceGNF * quantity, selectedCurrency)}
              </p>
            )}
          </div>
        )}

        {/* Payment Method */}
        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-[#0F1111]">Mode de paiement :</p>
          <div className="grid grid-cols-2 gap-2">
            {paymentMethods.map((pm) => (
              <button
                key={pm.id}
                onClick={() => setPaymentMethod(pm.id)}
                className={`rounded-lg border-2 px-3 py-2 text-left transition text-xs ${
                  paymentMethod === pm.id
                    ? `${pm.color} font-medium`
                    : 'border-[#DDD] text-[#565959] hover:border-[#999]'
                }`}
              >
                <span className="mr-1"><div className={`h-4 w-4 rounded-full ${pm.iconColor} inline-block`} /></span> {pm.label}
              </button>
            ))}
          </div>
        </div>

        {/* Total with delivery */}
        {currentSKU.stock > 0 && deliveryType === 'domicile' && (
          <div className="mb-4 rounded-lg bg-[#F7F8F8] p-3 text-sm">
            <div className="flex justify-between text-[#565959]">
              <span>Sous-total</span>
              <span>{formatPrice(currentSKU.priceGNF * quantity, selectedCurrency)}</span>
            </div>
            <div className="flex justify-between text-[#565959] mt-1">
              <span>Livraison</span>
              <span>{deliveryCostGNF > 0 ? formatPrice(deliveryCostGNF, selectedCurrency) : 'Gratuite'}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-[#DDD] pt-2 font-medium text-[#0F1111]">
              <span>Total</span>
              <span className="text-[#B12704]">{formatPrice(currentSKU.priceGNF * quantity + deliveryCostGNF, selectedCurrency)}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={addToCart}
            disabled={currentSKU.stock === 0}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#2E7D32] text-sm font-medium text-white shadow-sm transition-all hover:bg-[#1B5E20] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingCart className="h-4 w-4" />
            Ajouter au Panier
          </button>
          <button
            onClick={() => { addToCart(); router.push('/commande'); }}
            disabled={currentSKU.stock === 0}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#FF6600] text-sm font-medium text-white shadow-sm transition-all hover:bg-[#E65100] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Zap className="h-4 w-4" />
            Commander Maintenant
          </button>
        </div>

        {/* WhatsApp CTA */}
        <button
          onClick={() => window.open('https://wa.me/224000000000?text=Bonjour, je suis intéressé par le SoundCore Pro X1', '_blank')}
          className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-medium text-white shadow-sm transition-all hover:bg-[#128C7E] active:scale-[0.98]"
        >
          <MessageCircle className="h-4 w-4" />
          Commander via WhatsApp
        </button>

        {/* Wishlist */}
        <div className="mt-3 border-t border-[#DDD] pt-3">
          <button onClick={toggleWishlist} className="flex items-center gap-1.5 text-sm transition hover:text-[#CC0C39]">
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-[#CC0C39] text-[#CC0C39]' : 'text-[#565959]'}`} />
            <span className="text-[#007185]">
              {isWishlisted ? 'Ajouté aux Favoris' : 'Ajouter aux Favoris'}
            </span>
          </button>
        </div>

        {/* Security */}
        <div className="mt-3 border-t border-[#DDD] pt-3 text-xs text-[#565959]">
          <p className="mb-1">
            <span className="font-medium text-[#0F1111]">Expédié et vendu par</span>{' '}
            <span className="text-[#007185] hover:underline cursor-pointer">{product.seller}</span>
          </p>
          <button onClick={() => setShowGuarantee(!showGuarantee)}
            className="mt-2 flex w-full items-center justify-between text-xs">
            <span className="font-medium text-[#0F1111]">Garantie Achat Sécurisé</span>
            {showGuarantee ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {showGuarantee && (
            <div className="mt-2 space-y-1.5 rounded-lg bg-[#F7F8F8] p-3">
              {[
                { icon: Shield, text: 'Paiement 100% sécurisé' },
                { icon: RotateCcw, text: 'Retour gratuit sous 7 jours' },
                { icon: Award, text: 'Garantie authenticité' },
                { icon: HeadphonesIcon, text: 'Support WhatsApp 24/7' },
                { icon: CreditCard, text: 'Remboursement rapide' },
                { icon: Banknote, text: 'Prix le plus bas garanti' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2">
                  <item.icon className="h-3.5 w-3.5 text-[#2E7D32]" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
