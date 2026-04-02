import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [
      totalProducts,
      totalCategories,
      totalOrders,
      totalReviews,
      featuredProducts,
      totalStock,
    ] = await Promise.all([
      db.product.count({ where: { isActive: true } }),
      db.category.count(),
      db.order.count(),
      db.review.count(),
      db.product.count({ where: { isFeatured: true, isActive: true } }),
      db.product.aggregate({ _sum: { stock: true } }),
    ])

    const totalStockValue = totalStock._sum.stock || 0

    return NextResponse.json({
      totalProducts,
      totalCategories,
      totalOrders,
      totalReviews,
      featuredProducts,
      totalStock: totalStockValue,
      marketplaceName: 'Le Marché Africain',
      currency: 'GNF',
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
