import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateSession } from '@/app/api/auth/login/route';

export async function GET(request: NextRequest) {
  try {
    // Validate session & admin role
    const cookieToken = request.cookies.get('le-marche-token')?.value;
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const token = cookieToken || bearerToken;

    if (!token) {
      return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
    }

    const session = validateSession(token);
    if (!session) {
      return NextResponse.json({ error: 'Session expiree' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { role: true },
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { brand: { contains: search } },
        { slug: { contains: search } },
      ];
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: {
            select: { name: true, slug: true },
          },
        },
      }),
      db.product.count({ where }),
    ]);

    const formatted = products.map((p) => {
      let images: string[] = [];
      try { images = JSON.parse(p.images); } catch { /* ignore */ }
      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        brand: p.brand,
        description: p.description,
        priceGNF: p.priceGNF,
        originalPriceGNF: p.originalPriceGNF,
        stock: p.stock,
        isActive: p.isActive,
        isFeatured: p.isFeatured,
        isOfficial: p.isOfficial,
        rating: p.rating,
        ratingCount: p.ratingCount,
        salesCount: p.salesCount,
        categoryId: p.categoryId,
        categoryName: p.category.name,
        image: images[0] || null,
        createdAt: p.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      products: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin products error:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
