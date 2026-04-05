import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { products: { where: { isActive: true } } },
        },
      },
    })

    const formatted = categories.map((cat) => ({
      ...cat,
      productCount: cat._count.products,
    }))

    return NextResponse.json(formatted, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
