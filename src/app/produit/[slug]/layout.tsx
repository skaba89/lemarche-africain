import type { Metadata } from 'next';
import { db } from '@/lib/db';

interface ProductLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductLayoutProps): Promise<Metadata> {
  try {
    const { slug } = await params;

    const product = await db.product.findUnique({
      where: { slug, isActive: true },
      include: { category: true },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Parse first image for OG
    let mainImage = '';
    try {
      const images = JSON.parse(product.images as string);
      if (Array.isArray(images) && images.length > 0) {
        mainImage = typeof images[0] === 'string' ? images[0] : images[0]?.src || '';
      }
    } catch {
      // ignore
    }

    const priceStr = new Intl.NumberFormat('fr-FR').format(product.priceGNF);

    return {
      title: `${product.name} — ${product.brand} | Le Marché Africain`,
      description: `Achetez ${product.name} de ${product.brand} au meilleur prix sur Le Marché Africain. ${priceStr} GNF. Livraison rapide, paiement Orange Money. Produit authentique garanti.`,
      keywords: [
        product.name,
        product.brand,
        `acheter ${product.name} Guinée`,
        `${product.name} pas cher`,
        `acheter ${product.brand} Conakry`,
        product.category?.name || '',
      ].filter(Boolean),
      openGraph: {
        title: `${product.name} — ${product.brand}`,
        description: `Disponible sur Le Marché Africain à partir de ${priceStr} GNF. Livraison en Guinée.`,
        images: mainImage ? [{ url: mainImage, width: 800, height: 800, alt: product.name }] : [],
        type: 'website',
        locale: 'fr_FR',
        siteName: 'Le Marché Africain',
        url: `https://lemarcheafricain.gn/produit/${slug}`,
      },
      twitter: {
        card: 'summary_large_image',
        title: `${product.name} — ${product.brand} | Le Marché Africain`,
        description: `À partir de ${priceStr} GNF. Livraison en Guinée.`,
        images: mainImage ? [mainImage] : [],
      },
      robots: { index: true, follow: true },
      alternates: { canonical: `/produit/${slug}` },
    };
  } catch {
    return {
      title: 'Produit — Le Marché Africain',
      description:
        'Découvrez ce produit sur Le Marché Africain. Produits authentiques, livraison rapide, paiement mobile.',
      openGraph: {
        title: 'Produit — Le Marché Africain',
        description: 'Découvrez ce produit sur Le Marché Africain.',
        siteName: 'Le Marché Africain',
        locale: 'fr_FR',
      },
      robots: { index: true, follow: true },
    };
  }
}

export default function ProduitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
