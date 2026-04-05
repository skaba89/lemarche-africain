import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Confirmation de Commande — Le Marché Africain',
  description:
    'Votre commande a été confirmée sur Le Marché Africain. Suivez votre livraison et consultez les détails de votre commande en temps réel.',
  openGraph: {
    title: 'Confirmation de Commande — Le Marché Africain',
    description: 'Votre commande est confirmée. Suivez sa livraison.',
    url: 'https://lemarcheafricain.gn/commande/confirmation',
    siteName: 'Le Marché Africain',
    locale: 'fr_FR',
    type: 'website',
  },
  robots: { index: false, follow: false },
  alternates: { canonical: '/commande/confirmation' },
};

export default function ConfirmationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
