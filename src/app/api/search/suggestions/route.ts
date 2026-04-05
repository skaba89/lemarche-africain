import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();

  if (!q) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const products = await db.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q } },
          { brand: { contains: q } },
          { category: { name: { contains: q } } },
        ],
      },
      select: {
        slug: true,
        name: true,
        brand: true,
        priceGNF: true,
        images: true,
        category: {
          select: { name: true },
        },
      },
      take: 8,
      orderBy: { salesCount: 'desc' },
    });

    const suggestions = products.map((p) => {
      let images: string[] = [];
      try { images = JSON.parse(p.images); } catch { images = []; }
      return {
        slug: p.slug,
        name: p.name,
        brand: p.brand,
        priceGNF: p.priceGNF,
        image: images[0] || null,
        categoryName: p.category.name,
      };
    });

    return NextResponse.json({ suggestions }, {
      headers: { 'Cache-Control': 's-maxage=30' },
    });
  } catch (error) {
    console.error('Search suggestions error:', error);
    return NextResponse.json({ suggestions: [] });
  }
}
