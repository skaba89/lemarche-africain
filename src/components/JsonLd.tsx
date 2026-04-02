'use client';

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ============================================================
// Predefined schemas
// ============================================================

const SITE_URL = 'https://lemarcheafricain.gn';

/** Organization schema for the homepage */
export const organizationSchema: Record<string, unknown> = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Le Marché Africain',
  url: SITE_URL,
  logo: `${SITE_URL}/icon-192.png`,
  description:
    'Le meilleur marché en ligne d\'Afrique. Produits électroniques, téléphones, accessoires et plus. Livraison Conakry et provinces.',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+224-628-00-00-00',
    contactType: 'customer service',
    availableLanguage: ['French', 'fr'],
    areaServed: 'GN',
  },
  sameAs: [],
};

/** WebSite schema with search action */
export const webSiteSchema: Record<string, unknown> = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Le Marché Africain',
  url: SITE_URL,
  description:
    'Le meilleur marché en ligne d\'Afrique. Produits authentiques, livraison rapide, paiement mobile local.',
  inLanguage: 'fr',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/recherche?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

/** Helper: Generate Product schema from product data */
export function generateProductSchema(product: {
  name: string;
  brand: string;
  description: string;
  images: string;
  priceGNF: number;
  originalPriceGNF: number | null;
  rating: number;
  ratingCount: number;
  stock: number;
  slug: string;
  category: { name: string };
  seller?: string | null;
  sellerVerified?: boolean;
}): Record<string, unknown> {
  let mainImage = '';
  try {
    const imgs = JSON.parse(product.images);
    if (Array.isArray(imgs) && imgs.length > 0) {
      mainImage =
        typeof imgs[0] === 'string'
          ? imgs[0]
          : (imgs[0] as { src: string })?.src || '';
    }
  } catch {
    // ignore
  }

  const hasDiscount =
    product.originalPriceGNF &&
    product.originalPriceGNF > product.priceGNF;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: mainImage ? [mainImage] : [],
    description: product.description?.substring(0, 300) || '',
    sku: product.slug,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    category: product.category?.name || '',
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/produit/${product.slug}`,
      priceCurrency: 'GNF',
      price: String(product.priceGNF),
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: product.seller || 'Le Marché Africain',
      },
      ...(hasDiscount
        ? {
            'highPrice': String(product.originalPriceGNF),
            'lowPrice': String(product.priceGNF),
            'offerCount': '1',
          }
        : {}),
    },
    aggregateRating:
      product.ratingCount > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: String(product.rating),
            reviewCount: String(product.ratingCount),
            bestRating: '5',
            worstRating: '1',
          }
        : undefined,
  };
}

/** BreadcrumbList schema helper */
export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}
