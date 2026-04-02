'use client';

import { useProductStore, formatPrice } from '@/store/product-store';
import { product } from '@/data/product';
import { Star, Shield, Truck, RotateCcw, Share2, BadgeCheck, Check, Coins, Tag, CreditCard } from 'lucide-react';

function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${sizeClass} ${i <= Math.floor(rating) ? 'fill-[#FF8F00] text-[#FF8F00]' : i - 0.5 <= rating ? 'text-[#FF8F00]' : 'text-[#DDD]'}`} />
      ))}
    </div>
  );
}

export default function ProductInfo() {
  const {
    selectedColor, selectedSize, currentSKU,
    setSelectedColor, setSelectedSize, toggleShareMenu,
    selectedCurrency, selectedCountry,
  } = useProductStore();

  if (!currentSKU) return null;

  const discount = Math.round(((currentSKU.originalPriceGNF - currentSKU.priceGNF) / currentSKU.originalPriceGNF) * 100);
  const savings = currentSKU.originalPriceGNF - currentSKU.priceGNF;

  const isColorAvailable = (color: string) => product.skuMatrix.some((s) => s.color === color && s.stock > 0);
  const isColorSizeDisabled = (color: string, size: string) => {
    const sku = product.skuMatrix.find((s) => s.color === color && s.size === size);
    return sku ? sku.stock === 0 : true;
  };

  const promoTagStyles: Record<string, string> = {
    'Orange Money': 'bg-[#FF6600]/10 text-[#FF6600] border-[#FF6600]',
    'Livraison Offerte': 'bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D32]',
    'Vente Flash': 'bg-[#CC0C39]/10 text-[#CC0C39] border-[#CC0C39]',
    'Best Seller': 'bg-[#FF8F00]/10 text-[#E65100] border-[#FF8F00]',
    'Wave': 'bg-[#1DA1F2]/10 text-[#1DA1F2] border-[#1DA1F2]',
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Seller badge + country */}
      <div className="flex flex-wrap items-center gap-2">
        {product.sellerVerified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#E3F2FD] px-2.5 py-1 text-xs font-medium text-[#1565C0]">
            <BadgeCheck className="h-3.5 w-3.5" /> Vendeur Vérifié
          </span>
        )}
        <span className="text-xs text-[#565959]">{product.sellerRating}/5 · Membre depuis {product.sellerSince}</span>
        <span className="text-xs text-[#007185]">{selectedCountry.flag} Expédié vers {selectedCountry.name}</span>
      </div>

      {/* Title */}
      <div>
        <p className="mb-1 text-sm">
          <a href={product.brandUrl} className="text-[#007185] hover:text-[#E65100] hover:underline">Visiter la boutique {product.brand}</a>
        </p>
        <h1 className="text-[20px] leading-snug font-normal text-[#0F1111] md:text-[24px]">{product.name}</h1>
        <p className="mt-1 text-sm text-[#565959]">{product.subtitle}</p>
      </div>

      {/* Rating */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <StarRating rating={product.rating} />
        <span className="font-medium text-[#0F1111]">{product.rating.toFixed(1)}</span>
        <a href="#reviews" className="text-[#007185] hover:text-[#E65100] hover:underline">{product.ratingCount.toLocaleString('fr-FR')} évaluations</a>
        <span className="text-[#565959]">|</span>
        <span className="text-[#565959]">{product.salesCount} achetés ce mois</span>
      </div>

      {/* Price zone */}
      <div className="rounded-lg bg-gradient-to-r from-[#FFF8E1] to-[#FFF3E0] p-4 border border-[#FFE0B2]">
        <div className="mb-2 flex items-center gap-2">
          {discount > 0 && <span className="rounded bg-[#CC0C39] px-2.5 py-0.5 text-xs font-bold text-white">-{discount}% Vente Flash</span>}
          <span className="inline-flex items-center gap-1 rounded bg-[#E8F5E9] px-2.5 py-0.5 text-xs font-medium text-[#2E7D32]"><Coins className="h-3.5 w-3.5 text-[#2E7D32]" /> Économisez {formatPrice(savings, selectedCurrency)}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-[28px] font-normal text-[#B12704]">{formatPrice(currentSKU.priceGNF, selectedCurrency)}</span>
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="text-xs text-[#565959]">≈ {formatPrice(currentSKU.priceGNF, 'EUR')}</span>
          <span className="text-sm text-[#565959] line-through">{formatPrice(currentSKU.originalPriceGNF, selectedCurrency)}</span>
        </div>
        <div className="mt-2 rounded-lg bg-white/80 px-3 py-2 border border-dashed border-[#FF6600]">
          <span className="inline-flex items-center gap-1 text-sm font-medium text-[#FF6600]"><Tag className="h-3.5 w-3.5 text-[#FF6600]" /> {product.couponText}</span>
        </div>
        <p className="mt-2 inline-flex items-center gap-1 text-sm text-[#565959]"><CreditCard className="h-3.5 w-3.5 text-[#565959]" /> {product.installmentText}</p>
      </div>

      {/* Promo Tags */}
      <div className="flex flex-wrap gap-2">
        {product.promoTags.map((tag) => (
          <span key={tag} className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${promoTagStyles[tag] || 'bg-[#F7F8F8] text-[#565959] border-[#DDD]'}`}>{tag}</span>
        ))}
      </div>

      {/* Color Selection */}
      <div>
        <p className="mb-2 text-sm font-medium text-[#0F1111]">
          Couleur : <span className="font-normal text-[#565959]">{product.colors.find((c) => c.id === selectedColor)?.label}</span>
        </p>
        <div className="flex flex-wrap gap-3">
          {product.colors.map((color) => {
            const disabled = !isColorAvailable(color.id);
            const isSelected = selectedColor === color.id;
            return (
              <button key={color.id} onClick={() => !disabled && setSelectedColor(color.id)} disabled={disabled}
                className={`group relative flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm transition-all ${
                  disabled ? 'cursor-not-allowed border-[#EEE] bg-[#F5F5F5] text-[#999] opacity-60'
                  : isSelected ? 'border-[#E65100] bg-[#FFF3E0] text-[#E65100]' : 'border-[#DDD] hover:border-[#999]'
                }`}>
                {color.colorHex && <span className={`h-6 w-6 rounded-full border ${disabled ? 'border-[#DDD]' : 'border-[#999]'}`} style={{ backgroundColor: color.colorHex }} />}
                <span>{color.label}</span>
                {isSelected && <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#E65100] text-white"><Check className="h-3.5 w-3.5 text-white" /></span>}
                {disabled && <span className="absolute inset-0 flex items-center justify-center text-xs text-[#999] line-through">Épuisé</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Size Selection */}
      <div>
        <p className="mb-2 text-sm font-medium text-[#0F1111]">
          Taille : <span className="font-normal text-[#565959]">{product.sizes.find((s) => s.id === selectedSize)?.label}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((size) => {
            const disabled = isColorSizeDisabled(selectedColor, size.id);
            const isSelected = selectedSize === size.id;
            const stockForSize = product.skuMatrix.find((s) => s.color === selectedColor && s.size === size.id);
            return (
              <button key={size.id} onClick={() => !disabled && setSelectedSize(size.id)} disabled={disabled}
                className={`relative rounded-lg border-2 px-5 py-2 text-sm transition-all ${
                  disabled ? 'cursor-not-allowed border-[#EEE] bg-[#F5F5F5] text-[#999] opacity-60'
                  : isSelected ? 'border-[#E65100] bg-[#FFF3E0] text-[#E65100] font-medium' : 'border-[#DDD] hover:border-[#999]'
                }`}>
                {size.label}
                {!disabled && stockForSize && stockForSize.stock > 0 && stockForSize.stock < 5 && <span className="ml-1 text-xs text-[#CC0C39]">({stockForSize.stock} restants)</span>}
                {disabled && <span className="text-xs line-through">Indisponible</span>}
                {isSelected && <Check className="ml-1 h-3.5 w-3.5 text-[#E65100]" />}]
              </button>
            );
          })}
        </div>
      </div>

      {/* Trust badges */}
      <div className="flex flex-wrap gap-4 border-t border-[#DDD] pt-4 text-xs text-[#565959]">
        <div className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-[#2E7D32]" /><span>Produit Authentique</span></div>
        <div className="flex items-center gap-1.5"><Truck className="h-4 w-4 text-[#2E7D32]" /><span>Livré par {product.seller}</span></div>
        <div className="flex items-center gap-1.5"><RotateCcw className="h-4 w-4 text-[#2E7D32]" /><span>Retour sous 7 jours</span></div>
        <button onClick={toggleShareMenu} className="flex items-center gap-1.5 text-[#007185] hover:text-[#E65100] transition"><Share2 className="h-4 w-4" /><span>Partager</span></button>
      </div>
    </div>
  );
}
