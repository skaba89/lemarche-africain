import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mon Panier — Le Marché Africain',
  description:
    'Consultez votre panier sur Le Marché Africain. Paiement sécurisé par Orange Money, MTN MoMo, Wave. Livraison disponible en Guinée. Retours sous 14 jours.',
  openGraph: {
    title: 'Mon Panier — Le Marché Africain',
    description: 'Votre panier sur Le Marché Africain. Paiement sécurisé et livraison rapide.',
    url: 'https://lemarcheafricain.gn/panier',
    siteName: 'Le Marché Africain',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Mon Panier — Le Marché Africain',
    description: 'Consultez votre panier et finalisez votre achat.',
  },
  robots: { index: false, follow: true },
  alternates: { canonical: '/panier' },
};

export default function PanierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
