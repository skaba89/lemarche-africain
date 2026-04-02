import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Centre d'Aide — Le Marché Africain",
  description:
    'FAQ, retours, livraisons, paiements — trouvez toutes les réponses sur Le Marché Africain. Service client disponible par WhatsApp et téléphone.',
  keywords: [
    'aide',
    'FAQ',
    'retour produit',
    'livraison Guinée',
    'paiement Orange Money',
    'service client',
  ],
  openGraph: {
    title: "Centre d'Aide — Le Marché Africain",
    description: 'FAQ, retours, livraisons, paiements — trouvez toutes les réponses.',
    url: 'https://lemarcheafricain.gn/aide',
    siteName: 'Le Marché Africain',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: "Centre d'Aide — Le Marché Africain",
    description: 'Trouvez toutes les réponses à vos questions.',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: '/aide' },
};

export default function AideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
