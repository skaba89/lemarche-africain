import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateSession } from '@/app/api/auth/login/route';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();

    const { name, brand, priceGNF, originalPriceGNF, stock, isActive, isFeatured, categoryId, description } = body;

    // Build update data with only provided fields
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (brand !== undefined) data.brand = brand;
    if (priceGNF !== undefined) data.priceGNF = Number(priceGNF);
    if (originalPriceGNF !== undefined) data.originalPriceGNF = originalPriceGNF !== null ? Number(originalPriceGNF) : null;
    if (stock !== undefined) data.stock = Number(stock);
    if (isActive !== undefined) data.isActive = Boolean(isActive);
    if (isFeatured !== undefined) data.isFeatured = Boolean(isFeatured);
    if (categoryId !== undefined) data.categoryId = categoryId;
    if (description !== undefined) data.description = description;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Aucune donnee a mettre a jour' }, { status: 400 });
    }

    // Validate product exists
    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Produit non trouve' }, { status: 404 });
    }

    // Validate categoryId if provided
    if (categoryId) {
      const category = await db.category.findUnique({ where: { id: categoryId } });
      if (!category) {
        return NextResponse.json({ error: 'Categorie non trouvee' }, { status: 400 });
      }
    }

    const updated = await db.product.update({
      where: { id },
      data,
      include: {
        category: { select: { name: true, slug: true } },
      },
    });

    let images: string[] = [];
    try { images = JSON.parse(updated.images); } catch { /* ignore */ }

    return NextResponse.json({
      id: updated.id,
      slug: updated.slug,
      name: updated.name,
      brand: updated.brand,
      description: updated.description,
      priceGNF: updated.priceGNF,
      originalPriceGNF: updated.originalPriceGNF,
      stock: updated.stock,
      isActive: updated.isActive,
      isFeatured: updated.isFeatured,
      isOfficial: updated.isOfficial,
      rating: updated.rating,
      ratingCount: updated.ratingCount,
      salesCount: updated.salesCount,
      categoryId: updated.categoryId,
      categoryName: updated.category.name,
      image: images[0] || null,
    });
  } catch (error) {
    console.error('Admin product update error:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
