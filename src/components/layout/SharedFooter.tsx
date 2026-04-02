'use client';

import Link from 'next/link';
import {
  Store,
  Smartphone,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  ShieldCheck,
  ChevronRight,
  Banknote,
  CreditCard,
  MessageCircle,
} from 'lucide-react';
import RecentlyViewed from '@/components/product/RecentlyViewed';
import { BUSINESS } from '@/lib/constants';

const CATEGORIES = [
  { name: 'Audio', slug: 'audio' },
  { name: 'Téléphones', slug: 'telephones' },
  { name: 'Informatique', slug: 'informatique' },
  { name: 'Maison', slug: 'maison' },
  { name: 'Accessoires', slug: 'accessoires' },
  { name: 'Sport', slug: 'sport' },
];

const SOCIAL_LINKS = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Twitter, href: '#', label: 'Twitter / X' },
];

export default function SharedFooter() {
  const scrollToNewsletter = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('newsletter-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <footer className="mt-8 w-full border-t border-gray-200 dark:border-gray-700">
      {/* ── Récemment consultés ── */}
      <div className="bg-gray-50 dark:bg-gray-900 px-4 py-6 md:px-8">
        <div className="mx-auto max-w-[1500px]">
          <RecentlyViewed />
        </div>
      </div>

      {/* ── App Download Banner ── */}
      <div className="bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] px-4 py-8 md:px-8">
        <div className="mx-auto flex max-w-[1500px] flex-col items-center gap-6 text-center md:flex-row md:text-left">
          {/* Smartphone icon */}
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
            <Smartphone className="h-9 w-9 text-white" />
          </div>

          {/* Text content */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white md:text-2xl">
              Téléchargez notre application
            </h3>
            <p className="mt-1 text-sm text-green-100/80">
              Achetez et vendez plus facilement depuis votre téléphone
            </p>
          </div>

          {/* Store links */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-xl bg-black/30 px-5 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-black/50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" />
              </svg>
              Google Play
              <ChevronRight className="h-4 w-4 opacity-60" />
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-xl bg-black/30 px-5 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-black/50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              App Store
              <ChevronRight className="h-4 w-4 opacity-60" />
            </a>
          </div>
        </div>
      </div>

      {/* ── Main Footer Grid ── */}
      <div className="bg-gray-900 dark:bg-gray-950 px-4 py-10 md:px-8">
        <div className="mx-auto max-w-[1500px] grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1 — Le Marché Africain */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Store className="h-6 w-6 text-[#FF8F00]" />
              <span className="text-lg font-bold text-white">
                Le <span className="text-[#FF8F00]">Marché</span> Africain
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              Votre marketplace de confiance en Guinée. Découvrez des milliers de produits
              de qualité à prix compétitifs, livrés chez vous en toute sécurité.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-gray-300 transition-colors hover:bg-white/20 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 — Boutique */}
          <div>
            <h4 className="mb-4 text-sm font-semibold tracking-wide text-white uppercase">
              Boutique
            </h4>
            <ul className="space-y-2.5">
              {CATEGORIES.map(({ name, slug }) => (
                <li key={slug}>
                  <Link
                    href={`/recherche?category=${slug}`}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-[#FF8F00]"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Aide */}
          <div>
            <h4 className="mb-4 text-sm font-semibold tracking-wide text-white uppercase">
              Aide
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/aide"
                  className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-[#FF8F00]"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/compte"
                  className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-[#FF8F00]"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                  Mon Compte
                </Link>
              </li>
              <li>
                <Link
                  href="/compte#commandes"
                  className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-[#FF8F00]"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                  Suivi de commande
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-[#FF8F00]"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                  Politique de retour
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-[#FF8F00]"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                  Conditions d&apos;utilisation
                </a>
              </li>
              <li>
                <a
                  href="#newsletter-section"
                  onClick={scrollToNewsletter}
                  className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-[#FF8F00]"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                  Newsletter
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4 — Contact */}
          <div>
            <h4 className="mb-4 text-sm font-semibold tracking-wide text-white uppercase">
              Contact
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href={`tel:${BUSINESS.phone}`}
                  className="inline-flex items-start gap-2.5 text-sm text-gray-400 transition-colors hover:text-[#FF8F00]"
                >
                  <Phone className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{BUSINESS.phoneDisplay}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:contact@lemarche.africa`}
                  className="inline-flex items-start gap-2.5 text-sm text-gray-400 transition-colors hover:text-[#FF8F00]"
                >
                  <Mail className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>contact@lemarche.africa</span>
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${BUSINESS.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-2.5 text-sm text-gray-400 transition-colors hover:text-[#FF8F00]"
                >
                  <MessageCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>WhatsApp</span>
                </a>
              </li>
              <li>
                <Link
                  href="/aide"
                  className="inline-flex items-start gap-2.5 text-sm text-gray-400 transition-colors hover:text-[#FF8F00]"
                >
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>Conakry, Guinée</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-gray-800 dark:border-gray-800 bg-gray-900 dark:bg-gray-950 px-4 py-5 pb-20 lg:pb-5">
        <div className="mx-auto flex max-w-[1500px] flex-col items-center gap-4 md:flex-row md:justify-between">
          {/* Copyright */}
          <p className="text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Le Marché Africain. Tous droits réservés.
          </p>

          {/* Separator (visible on md+) */}
          <span className="hidden h-4 w-px bg-gray-700 md:block" aria-hidden />

          {/* Payment methods */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-[#FF6600]" />
              Orange Money
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-[#FFC107]" />
              MTN MoMo
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-[#1DA1F2]" />
              Wave
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Banknote className="h-3.5 w-3.5" />
              Cash
            </span>
          </div>

          {/* Trust badge */}
          <div className="hidden items-center gap-1.5 text-xs text-gray-500 lg:inline-flex">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Paiements sécurisés</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
