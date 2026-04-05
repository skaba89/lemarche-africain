import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Passer ma commande — Le Marché Africain',
  description:
    'Finalisez votre commande sur Le Marché Africain. Livraison à domicile ou retrait gratuit. Paiement Orange Money, MTN MoMo, Wave, Cash. Livraison Conakry et provinces.',
  openGraph: {
    title: 'Passer ma commande — Le Marché Africain',
    description: 'Finalisez votre achat. Livraison rapide et paiement mobile sécurisé.',
    url: 'https://lemarcheafricain.gn/commande',
    siteName: 'Le Marché Africain',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Passer ma commande — Le Marché Africain',
    description: 'Finalisez votre achat sur Le Marché Africain.',
  },
  robots: { index: false, follow: false },
  alternates: { canonical: '/commande' },
};

export default function CommandeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
