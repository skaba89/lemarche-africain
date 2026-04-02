import { db } from '@/lib/db';
import HomeClient from '@/components/home/HomeClient';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch all data in parallel
  const [categories, featuredProducts, bestSellers, newArrivals, allProductsData] = await Promise.all([
    // Categories with product count
    db.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { order: 'asc' },
    }),
    // Featured products
    db.product.findMany({
      where: { isFeatured: true, isActive: true },
      include: { category: { select: { slug: true, name: true } } },
      take: 6,
      orderBy: { createdAt: 'desc' },
    }),
    // Best sellers (sorted by salesCount)
    db.product.findMany({
      where: { isActive: true },
      include: { category: { select: { slug: true, name: true } } },
      take: 6,
      orderBy: { salesCount: 'desc' },
    }),
    // New arrivals
    db.product.findMany({
      where: { isActive: true },
      include: { category: { select: { slug: true, name: true } } },
      take: 6,
      orderBy: { createdAt: 'desc' },
    }),
    // All products (first page for "load more" pagination)
    db.product.findMany({
      where: { isActive: true },
      include: { category: { select: { slug: true, name: true } } },
      take: 8,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  // Total count for pagination
  const totalProducts = await db.product.count({ where: { isActive: true } });

  // Transform categories
  const transformedCategories = categories.map((cat) => ({
    id: cat.id,
    slug: cat.slug,
    name: cat.name,
    description: cat.description,
    image: cat.image,
    productCount: cat._count.products,
  }));

  // Helper to transform a product
  function transformProduct(product: typeof allProductsData[number]) {
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      priceGNF: product.priceGNF,
      originalPriceGNF: product.originalPriceGNF,
      rating: product.rating,
      ratingCount: product.ratingCount,
      images: product.images,
      isOfficial: product.isOfficial,
      stock: product.stock,
      isFeatured: product.isFeatured,
      salesCount: product.salesCount,
      createdAt: product.createdAt.toISOString(),
      category: {
        slug: product.category.slug,
        name: product.category.name,
      },
    };
  }

  return (
    <HomeClient
      categories={transformedCategories}
      featuredProducts={featuredProducts.map(transformProduct)}
      bestSellers={bestSellers.map(transformProduct)}
      newArrivals={newArrivals.map(transformProduct)}
      allProducts={allProductsData.map(transformProduct)}
      allHasMore={totalProducts > 8}
    />
  );
}
