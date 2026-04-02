'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { product, ratingDistribution, formatGNF, formatEUR, type Review } from '@/data/product';
import { Star, ChevronLeft, ChevronRight, ThumbsUp, Camera, Filter, CheckCircle, MapPin } from 'lucide-react';

function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${sizeClass} ${i <= rating ? 'fill-[#FF8F00] text-[#FF8F00]' : 'text-[#DDD]'}`} />
      ))}
    </div>
  );
}

// ============================================================
// Specifications
// ============================================================

function SpecsTab() {
  return (
    <div className="overflow-x-auto">
      <h3 className="mb-4 text-lg font-medium text-[#0F1111]">Caractéristiques Techniques</h3>
      <table className="w-full border-collapse text-sm">
        <tbody>
          {product.specifications.map((spec, index) => (
            <tr key={spec.name} className={index % 2 === 0 ? 'bg-[#F7F8F8]' : 'bg-white'}>
              <td className="w-1/3 px-4 py-2.5 font-medium text-[#565959]">{spec.name}</td>
              <td className="px-4 py-2.5 text-[#0F1111]">{spec.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// Detail Images — A+ Content Style
// ============================================================

function DetailImagesTab() {
  const sections = [
    { image: '/product-images/headphone-front.png', title: 'Réduction de Bruit Active N°1 de la Catégorie',
      description: 'Notre technologie ANC hybride propriétaire utilise 6 microphones pour détecter et annuler jusqu\'à 98% du bruit ambiant. Que vous soyez dans un taxi de Conakry ou au bureau, plongez dans un son pur.' },
    { image: '/product-images/headphone-controls.png', title: 'Commandes Tactiles Intuitives',
      description: 'Contrôlez votre musique, réglez le volume, répondez aux appels et activez l\'ANC avec des gestes tactiles intuitifs sur l\'écouteur droit. Sans boutons, sans complication.' },
    { image: '/product-images/headphone-worn.png', title: 'Ultra-Confortable pour Toute la Journée',
      description: 'Conçu avec des coussinets en cuir protéine premium et une mousse à mémoire qui s\'adapte à la forme de votre tête. Seulement 250g pour un confort zéro fatigue, même après 12h d\'utilisation continue.' },
    { image: '/product-images/headphone-case.png', title: 'Accessoires Premium Inclus',
      description: 'Livré avec une coque rigide de transport, des câbles USB-C et 3.5mm, et un adaptateur avion. Tout ce dont vous avez besoin pour une expérience audio parfaite, partout.' },
  ];

  return (
    <div className="space-y-8">
      <h3 className="text-lg font-medium text-[#0F1111]">Découvrez le SoundCore Pro X1</h3>
      {sections.map((section, index) => (
        <div key={index} className={`flex flex-col gap-6 md:flex-row ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
          <div className="relative aspect-square w-full md:w-1/2 shrink-0">
            <Image src={section.image} alt={section.title} fill className="rounded-lg object-contain bg-white p-4"
              sizes="(max-width: 768px) 100vw, 50vw" loading="lazy" />
          </div>
          <div className="flex flex-col justify-center md:w-1/2">
            <h4 className="mb-3 text-xl font-medium text-[#0F1111]">{section.title}</h4>
            <p className="text-sm leading-relaxed text-[#565959]">{section.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Reviews
// ============================================================

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const [helpfulVoted, setHelpfulVoted] = useState(false);
  const isLong = review.body.length > 300;

  return (
    <div className="border-b border-[#EEE] pb-6 mb-6 last:border-b-0 last:mb-0">
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium text-white ${review.avatarBg || 'bg-[#565959]'}`}>
          {review.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-[#0F1111]">{review.author}</span>
            {review.verified && (
              <span className="inline-flex items-center gap-1 text-xs text-[#2E7D32]">
                <CheckCircle className="h-3 w-3" /> Achat Vérifié
              </span>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <StarRating rating={review.rating} size="sm" />
            <span className="text-xs text-[#565959]">{review.title}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-[#999]">
            <span>{review.date}</span>
            {review.location && (
              <span className="flex items-center gap-0.5">
                <MapPin className="h-2.5 w-2.5" /> {review.location}
              </span>
            )}
          </div>
        </div>
      </div>

      <h4 className="mt-3 text-sm font-medium text-[#0F1111]">{review.title}</h4>
      <p className="mt-1 text-sm leading-relaxed text-[#565959]">
        {expanded ? review.body : review.body.slice(0, 300)}{isLong && !expanded && '...'}
      </p>
      {isLong && (
        <button onClick={() => setExpanded(!expanded)}
          className="mt-1 text-xs font-medium text-[#007185] hover:text-[#E65100] hover:underline">
          {expanded ? 'Voir moins' : 'Lire la suite'}
        </button>
      )}

      {review.photos && review.photos.length > 0 && (
        <div className="mt-3 flex gap-2">
          {review.photos.map((photo, i) => (
            <div key={i} className="relative h-16 w-16 overflow-hidden rounded-md border border-[#DDD]">
              <Image src={photo} alt={`Photo ${i + 1}`} fill className="object-cover" sizes="64px" />
              <div className="absolute bottom-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/50">
                <Camera className="h-2.5 w-2.5 text-white" />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-[#565959]">{review.helpful} personnes ont trouvé cet avis utile</span>
        <button onClick={() => setHelpfulVoted(true)} disabled={helpfulVoted}
          className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition ${
            helpfulVoted ? 'border-[#007185] bg-[#007185]/10 text-[#007185]' : 'border-[#DDD] text-[#565959] hover:border-[#999]'
          }`}>
          <ThumbsUp className="h-3 w-3" /> Utile
        </button>
      </div>
    </div>
  );
}

function ReviewsTab() {
  const [filterStar, setFilterStar] = useState<number | null>(null);
  const [showPhotosOnly, setShowPhotosOnly] = useState(false);

  const filteredReviews = product.reviews.filter((review) => {
    if (filterStar && review.rating !== filterStar) return false;
    if (showPhotosOnly && (!review.photos || review.photos.length === 0)) return false;
    return true;
  });

  return (
    <div id="reviews">
      <h3 className="mb-6 text-lg font-medium text-[#0F1111]">Avis Clients</h3>

      <div className="mb-8 flex flex-col gap-6 rounded-lg bg-[#F7F8F8] p-6 md:flex-row">
        <div className="text-center md:border-r md:border-[#DDD] md:pr-8">
          <div className="text-4xl font-medium text-[#0F1111]">{product.rating}</div>
          <div className="mt-1"><StarRating rating={Math.round(product.rating)} /></div>
          <p className="mt-1 text-sm text-[#565959]">{product.ratingCount.toLocaleString('fr-FR')} évaluations</p>
        </div>
        <div className="flex-1">
          {ratingDistribution.map((item) => (
            <div key={item.stars} className="mb-1.5 flex items-center gap-2">
              <button onClick={() => setFilterStar(filterStar === item.stars ? null : item.stars)}
                className={`w-12 shrink-0 text-right text-sm ${filterStar === item.stars ? 'font-medium text-[#E65100]' : 'text-[#0F1111]'} hover:text-[#E65100]`}>
                <span className="inline-flex items-center gap-0.5"><span>{item.stars}</span><Star className="h-3 w-3" /></span>
              </button>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#DDD]">
                <div className="h-full rounded-full bg-[#FF8F00] transition-all duration-300" style={{ width: `${item.percentage}%` }} />
              </div>
              <span className="w-10 shrink-0 text-right text-xs text-[#565959]">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 text-sm">
          <Filter className="h-4 w-4 text-[#565959]" />
          <span className="text-[#565959]">Filtrer :</span>
        </div>
        {[5, 4, 3, 2, 1].map((star) => (
          <button key={star} onClick={() => setFilterStar(filterStar === star ? null : star)}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              filterStar === star ? 'border-[#FF8F00] bg-[#FF8F00]/10 text-[#E65100] font-medium' : 'border-[#DDD] text-[#565959] hover:border-[#999]'
            }`}>
            {star} Étoile{star > 1 ? 's' : ''}
          </button>
        ))}
        <button onClick={() => setShowPhotosOnly(!showPhotosOnly)}
          className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition ${
            showPhotosOnly ? 'border-[#007185] bg-[#007185]/10 text-[#007185] font-medium' : 'border-[#DDD] text-[#565959] hover:border-[#999]'
          }`}>
          <Camera className="h-3 w-3" /> Avec Photos
        </button>
        {(filterStar || showPhotosOnly) && (
          <button onClick={() => { setFilterStar(null); setShowPhotosOnly(false); }}
            className="text-xs text-[#007185] hover:text-[#E65100] hover:underline">Tout effacer</button>
        )}
      </div>

      <div className="max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
        {filteredReviews.length > 0
          ? filteredReviews.map((review) => <ReviewCard key={review.id} review={review} />)
          : <p className="py-8 text-center text-sm text-[#565959]">Aucun avis ne correspond aux filtres sélectionnés.</p>
        }
      </div>
    </div>
  );
}

// ============================================================
// Related Products
// ============================================================

function RelatedProductsTab() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: direction === 'left' ? -280 : 280, behavior: 'smooth' });
  };

  return (
    <div>
      <h3 className="mb-4 text-lg font-medium text-[#0F1111]">Clients qui ont vu cet article ont aussi consulté</h3>
      <div className="relative group">
        <button onClick={() => scroll('left')}
          className="absolute -left-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white p-2 shadow-lg border border-[#DDD] hover:bg-[#F7F8F8] group-hover:flex md:flex">
          <ChevronLeft className="h-5 w-5 text-[#565959]" />
        </button>
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
          {product.relatedProducts.map((item) => {
            const hasDiscount = item.originalPriceGNF && item.originalPriceGNF > item.priceGNF;
            return (
              <div key={item.id} className="shrink-0 w-[200px] snap-start rounded-lg border border-[#DDD] bg-white p-3 transition-shadow hover:shadow-md cursor-pointer relative">
                {item.isOfficial && (
                  <span className="absolute top-2 left-2 rounded bg-[#1565C0] px-1.5 py-0.5 text-[9px] font-bold text-white z-10">OFFICIEL</span>
                )}
                <div className="relative aspect-square w-full mb-3 overflow-hidden rounded-md bg-[#F7F8F8]">
                  <Image src={item.image} alt={item.title} fill className="object-contain p-2" sizes="200px" loading="lazy" />
                </div>
                <h4 className="text-xs leading-tight text-[#0F1111] line-clamp-2 min-h-[2rem]">{item.title}</h4>
                <div className="mt-1.5 flex items-center gap-1">
                  <StarRating rating={Math.round(item.rating)} size="sm" />
                  <span className="text-[10px] text-[#007185]">{item.ratingCount.toLocaleString('fr-FR')}</span>
                </div>
                <div className="mt-1">
                  <span className="text-sm font-medium text-[#B12704]">{formatGNF(item.priceGNF)}</span>
                  <p className="text-[10px] text-[#565959]">≈ {formatEUR(item.priceEUR)}</p>
                </div>
                {hasDiscount && (
                  <span className="mt-1 inline-block rounded bg-[#CC0C39]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#CC0C39]">
                    -{Math.round(((item.originalPriceGNF! - item.priceGNF) / item.originalPriceGNF!) * 100)}%
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <button onClick={() => scroll('right')}
          className="absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white p-2 shadow-lg border border-[#DDD] hover:bg-[#F7F8F8] group-hover:flex md:flex">
          <ChevronRight className="h-5 w-5 text-[#565959]" />
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Tabs
// ============================================================

const tabs = [
  { id: 'specs', label: 'Caractéristiques' },
  { id: 'details', label: 'Description' },
  { id: 'reviews', label: `Avis (${product.ratingCount.toLocaleString('fr-FR')})` },
  { id: 'related', label: 'Produits Similaires' },
] as const;

type TabId = (typeof tabs)[number]['id'];

export default function ProductTabs() {
  const [activeTab, setActiveTab] = useState<TabId>('specs');
  const [animating, setAnimating] = useState(false);

  const handleTabChange = (tabId: TabId) => {
    if (tabId === activeTab) return;
    setAnimating(true);
    setTimeout(() => { setActiveTab(tabId); setAnimating(false); }, 150);
  };

  return (
    <div className="w-full">
      <div className="border-b border-[#DDD]">
        <div className="flex gap-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => handleTabChange(tab.id)}
              className={`relative whitespace-nowrap px-5 py-3 text-sm transition-colors ${
                activeTab === tab.id ? 'font-medium text-[#E65100]' : 'text-[#565959] hover:text-[#0F1111]'
              }`}>
              {tab.label}
              {activeTab === tab.id && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E65100]" />}
            </button>
          ))}
        </div>
      </div>
      <div className={`transition-all duration-200 pt-6 ${animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
        {activeTab === 'specs' && <SpecsTab />}
        {activeTab === 'details' && <DetailImagesTab />}
        {activeTab === 'reviews' && <ReviewsTab />}
        {activeTab === 'related' && <RelatedProductsTab />}
      </div>
    </div>
  );
}
