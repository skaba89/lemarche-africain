import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mon Compte — Le Marché Africain',
  description:
    'Gérez votre compte Le Marché Africain. Suivez vos commandes, modifiez vos informations personnelles, gérez vos favoris et vos adresses de livraison.',
  openGraph: {
    title: 'Mon Compte — Le Marché Africain',
    description: 'Gérez votre compte et suivez vos commandes.',
    url: 'https://lemarcheafricain.gn/compte',
    siteName: 'Le Marché Africain',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Mon Compte — Le Marché Africain',
    description: 'Gérez votre compte Le Marché Africain.',
  },
  robots: { index: false, follow: false },
  alternates: { canonical: '/compte' },
};

export default function CompteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
