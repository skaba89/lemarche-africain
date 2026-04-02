import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rechercher des produits — Le Marché Africain',
  description:
    'Trouvez les meilleurs produits en Guinée et en Afrique. Électronique, téléphones, accessoires et plus. Filtrez par catégorie, prix, marque.',
  keywords: [
    'recherche produits',
    'e-commerce Guinée',
    'téléphone Conakry',
    'électronique Afrique',
    'meilleurs prix Guinée',
  ],
  openGraph: {
    title: 'Rechercher des produits — Le Marché Africain',
    description:
      'Trouvez les meilleurs produits en Guinée et en Afrique sur Le Marché Africain.',
    url: 'https://lemarcheafricain.gn/recherche',
    siteName: 'Le Marché Africain',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Rechercher des produits — Le Marché Africain',
    description: 'Trouvez les meilleurs produits en Guinée et en Afrique.',
  },
  robots: { index: false, follow: true },
  alternates: { canonical: '/recherche' },
};

export default function RechercheLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
