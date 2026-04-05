import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const product = await db.product.findUnique({
      where: { slug, isActive: true },
      include: { category: true },
    })

    if (!product) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 })
    }

    // Get related products (same category, different product)
    const related = await db.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true,
      },
      include: { category: true },
      take: 4,
      orderBy: { salesCount: 'desc' },
    })

    // Get reviews for this product
    const reviews = await db.review.findMany({
      where: { productId: product.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ product, related, reviews })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
