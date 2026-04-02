'use client';

import Link from 'next/link';
import { Store, MessageCircle, Phone, Mail, MapPin, Banknote, CreditCard } from 'lucide-react';
import RecentlyViewed from '@/components/product/RecentlyViewed';

export default function SharedFooter() {
  return (
    <footer className="mt-8 w-full border-t border-[#DDD] dark:border-gray-700">
      {/* Récemment consultés */}
      <div className="bg-[#F7F8F8] dark:bg-gray-900 px-4 py-6 md:px-8">
        <div className="mx-auto max-w-[1500px]">
          <RecentlyViewed />
        </div>
      </div>

      {/* Links */}
      <div className="border-t border-[#DDD] dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-6 md:px-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <h4 className="mb-2 text-sm font-medium text-[#0F1111] dark:text-gray-200">&Agrave; Propos</h4>
            <ul className="space-y-1 text-xs text-[#005A6E] dark:text-gray-300">
              <li><Link href="/aide#about" className="hover:text-[#E65100] dark:hover:text-[#FF8F00] hover:underline">Qui sommes-nous</Link></li>
              <li><Link href="/aide#careers" className="hover:text-[#E65100] dark:hover:text-[#FF8F00] hover:underline">Carri&egrave;res</Link></li>
              <li><Link href="/aide#seller" className="hover:text-[#E65100] dark:hover:text-[#FF8F00] hover:underline">Devenir Vendeur</Link></li>
              <li><Link href="/aide#press" className="hover:text-[#E65100] dark:hover:text-[#FF8F00] hover:underline">Presse</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 text-sm font-medium text-[#0F1111] dark:text-gray-200">Aide</h4>
            <ul className="space-y-1 text-xs text-[#005A6E] dark:text-gray-300">
              <li><Link href="/aide" className="hover:text-[#E65100] dark:hover:text-[#FF8F00] hover:underline">Centre d&apos;Aide</Link></li>
              <li><Link href="/aide" className="hover:text-[#E65100] dark:hover:text-[#FF8F00] hover:underline">Retours &amp; Remboursements</Link></li>
              <li><Link href="/compte#commandes" className="hover:text-[#E65100] dark:hover:text-[#FF8F00] hover:underline">Suivi de Commande</Link></li>
              <li><Link href="/aide" className="hover:text-[#E65100] dark:hover:text-[#FF8F00] hover:underline">FAQ</Link></li>
              <li>
                <a
                  href="#newsletter"
                  onClick={(e) => {
                    e.preventDefault();
                    const newsletter = document.getElementById('newsletter-section');
                    if (newsletter) {
                      newsletter.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  className="inline-flex items-center gap-1 hover:text-[#E65100] dark:hover:text-[#FF8F00] hover:underline"
                >
                  <Mail className="h-3.5 w-3.5" /> Newsletter
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 text-sm font-medium text-[#0F1111] dark:text-gray-200">Paiement</h4>
            <ul className="space-y-1 text-xs text-[#005A6E] dark:text-gray-300">
              <li><Link href="/aide" className="hover:text-[#E65100] dark:hover:text-[#FF8F00] hover:underline">Orange Money</Link></li>
              <li><Link href="/aide" className="hover:text-[#E65100] dark:hover:text-[#FF8F00] hover:underline">MTN Mobile Money</Link></li>
              <li><Link href="/aide" className="hover:text-[#E65100] dark:hover:text-[#FF8F00] hover:underline">Paiement &agrave; la Livraison</Link></li>
              <li><Link href="/aide" className="hover:text-[#E65100] dark:hover:text-[#FF8F00] hover:underline">Carte Bancaire</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 text-sm font-medium text-[#0F1111] dark:text-gray-200">Contact</h4>
            <ul className="space-y-1 text-xs text-[#005A6E] dark:text-gray-300">
              <li><a href="https://wa.me/224628000000" target="_blank" rel="noopener" className="inline-flex items-center gap-1 hover:text-[#E65100] dark:hover:text-[#FF8F00] hover:underline"><MessageCircle className="h-4 w-4" /> WhatsApp</a></li>
              <li><a href="tel:+224628000000" className="inline-flex items-center gap-1 hover:text-[#E65100] dark:hover:text-[#FF8F00] hover:underline"><Phone className="h-4 w-4" /> +224 628 00 00 00</a></li>
              <li><a href="mailto:support@lemarcheafricain.gn" className="inline-flex items-center gap-1 hover:text-[#E65100] dark:hover:text-[#FF8F00] hover:underline"><Mail className="h-4 w-4" /> support@lemarcheafricain.gn</a></li>
              <li><Link href="/aide" className="inline-flex items-center gap-1 hover:text-[#E65100] dark:hover:text-[#FF8F00] hover:underline"><MapPin className="h-4 w-4" /> Conakry, Guin&eacute;e</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#DDD] dark:border-gray-700 bg-[#1B5E20] px-4 py-4">
        <div className="mx-auto max-w-[1500px] flex flex-col items-center gap-2 md:flex-row md:justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Store className="h-5 w-5 text-white" />
            <span className="text-sm font-bold text-white">Le <span className="text-[#FF8F00]">March&eacute;</span> Africain</span>
            <span className="text-xs text-[#B9F6CA]">Guin&eacute;e</span>
          </Link>
          <div className="flex flex-wrap justify-center gap-3 text-xs text-[#B9F6CA]">
            <span className="inline-flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-[#FF6600]" /> Orange Money</span>
            <span className="inline-flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-[#FFC107]" /> MTN MoMo</span>
            <span className="inline-flex items-center gap-1"><Banknote className="h-3.5 w-3.5 text-[#B9F6CA]" /> Cash</span>
            <span className="inline-flex items-center gap-1"><CreditCard className="h-3.5 w-3.5 text-[#B9F6CA]" /> Carte</span>
            <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-[#B9F6CA]" /> Points de Retrait</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/qa" className="text-[10px] text-[#A5D6A7] hover:text-white transition-colors">
              QA
            </Link>
            <span className="text-[10px] text-[#A5D6A7]">
              &copy; {new Date().getFullYear()} Le March&eacute; Africain &mdash; Tous droits r&eacute;serv&eacute;s
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
