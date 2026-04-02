'use client';

import { product, formatGNF } from '@/data/product';
import Image from 'next/image';
import { Star, Store, MessageCircle, Phone, Mail, MapPin, Banknote, CreditCard } from 'lucide-react';
import Link from 'next/link';

// ============================================================
// Footer — Le Marché Africain
// ============================================================

export default function Footer() {
  return (
    <footer className="mt-8 w-full border-t border-[#DDD]">
      {/* Recommendations */}
      <div className="bg-[#F7F8F8] px-4 py-6 md:px-8">
        <h3 className="mb-4 text-base font-medium text-[#0F1111]">
          Vous avez aussi consulté
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {product.relatedProducts.slice(0, 4).map((item) => (
            <Link key={item.id} href="/"
              className="shrink-0 w-[150px] rounded-lg border border-[#DDD] bg-white p-2.5 transition-shadow hover:shadow-sm">
              <div className="relative aspect-square w-full mb-2 overflow-hidden rounded bg-[#F7F8F8]">
                <Image src={item.image} alt={item.title} fill className="object-contain p-2" sizes="150px" loading="lazy" />
              </div>
              <h4 className="text-xs text-[#0F1111] line-clamp-2 min-h-[2rem] leading-tight">{item.title}</h4>
              <div className="mt-1 flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className={`h-2.5 w-2.5 ${i <= Math.round(item.rating) ? 'fill-[#FF8F00] text-[#FF8F00]' : 'text-[#DDD]'}`} />
                ))}
              </div>
              <p className="mt-1 text-xs font-medium text-[#B12704]">{formatGNF(item.priceGNF)}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="border-t border-[#DDD] bg-white px-4 py-6 md:px-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <h4 className="mb-2 text-sm font-medium text-[#0F1111]">À Propos</h4>
            <ul className="space-y-1 text-xs text-[#007185]">
              <li><Link href="/aide" className="hover:text-[#E65100] hover:underline">Qui sommes-nous</Link></li>
              <li><Link href="/aide" className="hover:text-[#E65100] hover:underline">Carrières</Link></li>
              <li><Link href="/aide" className="hover:text-[#E65100] hover:underline">Devenir Vendeur</Link></li>
              <li><Link href="/aide" className="hover:text-[#E65100] hover:underline">Presse</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 text-sm font-medium text-[#0F1111]">Aide</h4>
            <ul className="space-y-1 text-xs text-[#007185]">
              <li><Link href="/aide" className="hover:text-[#E65100] hover:underline">Centre d&apos;Aide</Link></li>
              <li><Link href="/aide" className="hover:text-[#E65100] hover:underline">Retours &amp; Remboursements</Link></li>
              <li><Link href="/compte" className="hover:text-[#E65100] hover:underline">Suivi de Commande</Link></li>
              <li><Link href="/aide" className="hover:text-[#E65100] hover:underline">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 text-sm font-medium text-[#0F1111]">Paiement</h4>
            <ul className="space-y-1 text-xs text-[#007185]">
              <li><Link href="/aide" className="hover:text-[#E65100] hover:underline">Orange Money</Link></li>
              <li><Link href="/aide" className="hover:text-[#E65100] hover:underline">MTN Mobile Money</Link></li>
              <li><Link href="/aide" className="hover:text-[#E65100] hover:underline">Paiement à la Livraison</Link></li>
              <li><Link href="/aide" className="hover:text-[#E65100] hover:underline">Carte Bancaire</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 text-sm font-medium text-[#0F1111]">Contact</h4>
            <ul className="space-y-1 text-xs text-[#007185]">
              <li><a href="https://wa.me/224000000000" target="_blank" rel="noopener" className="inline-flex items-center gap-1 hover:text-[#E65100] hover:underline"><MessageCircle className="h-4 w-4" /> WhatsApp</a></li>
              <li><a href="tel:+224000000000" className="inline-flex items-center gap-1 hover:text-[#E65100] hover:underline"><Phone className="h-4 w-4" /> +224 XXX XX XX XX</a></li>
              <li><a href="mailto:support@lemarcheafricain.gn" className="inline-flex items-center gap-1 hover:text-[#E65100] hover:underline"><Mail className="h-4 w-4" /> support@lemarcheafricain.gn</a></li>
              <li><Link href="/aide" className="inline-flex items-center gap-1 hover:text-[#E65100] hover:underline"><MapPin className="h-4 w-4" /> Conakry, Guinée</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#DDD] bg-[#1B5E20] px-4 py-4">
        <div className="mx-auto max-w-[1500px] flex flex-col items-center gap-2 md:flex-row md:justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Store className="h-5 w-5 text-white" />
            <span className="text-sm font-bold text-white">Le <span className="text-[#FF8F00]">Marché</span> Africain</span>
            <span className="text-xs text-[#A5D6A7]">Guinée</span>
          </Link>
          <div className="flex flex-wrap justify-center gap-3 text-xs text-[#A5D6A7]">
            <span className="inline-flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-[#FF6600]" /> Orange Money</span>
            <span className="inline-flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-[#FFC107]" /> MTN MoMo</span>
            <span className="inline-flex items-center gap-1"><Banknote className="h-3.5 w-3.5 text-[#A5D6A7]" /> Cash</span>
            <span className="inline-flex items-center gap-1"><CreditCard className="h-3.5 w-3.5 text-[#A5D6A7]" /> Carte</span>
            <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-[#A5D6A7]" /> Points de Retrait</span>
          </div>
          <p className="text-[10px] text-[#81C784]">
            &copy; {new Date().getFullYear()} Le Marché Africain — Tous droits réservés
          </p>
        </div>
      </div>
    </footer>
  );
}
