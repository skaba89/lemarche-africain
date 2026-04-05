import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';

const BASE_URL = 'https://lemarcheafricain.gn';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/recherche`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/aide`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Low-priority pages (noindex, but still declare them)
  const utilityPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/panier`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/commande`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/compte`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.2,
    },
  ];

  // Dynamic product pages
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const products = await db.product.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
      where: { stock: { gt: 0 } },
      orderBy: { updatedAt: 'desc' },
    });

    productPages = products.map((product) => ({
      url: `${BASE_URL}/produit/${product.slug}`,
      lastModified: product.updatedAt || now,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }));
  } catch {
    // If DB is not available, skip product pages
  }

  // Dynamic category pages
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const categories = await db.category.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    categoryPages = categories.map((category) => ({
      url: `${BASE_URL}/recherche?category=${category.slug}`,
      lastModified: category.updatedAt || now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch {
    // If DB is not available, skip category pages
  }

  return [...staticPages, ...productPages, ...categoryPages, ...utilityPages];
}
