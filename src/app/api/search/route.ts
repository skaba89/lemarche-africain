import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  // Rate limiting: 100 requests/minute for general API
  const { success, remaining } = rateLimit(request, 'search', 100, 60)
  if (!success) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Réessayez dans une minute.' },
      { status: 429, headers: { 'X-RateLimit-Remaining': String(remaining) } }
    )
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const q = searchParams.get('q') || ''
    const category = searchParams.get('category')
    const brand = searchParams.get('brand') // comma-separated
    const minRating = parseInt(searchParams.get('rating') || '0')
    const inStock = searchParams.get('inStock') === 'true'
    const onSale = searchParams.get('onSale') === 'true'
    const minPrice = parseInt(searchParams.get('minPrice') || '0')
    const maxPrice = parseInt(searchParams.get('maxPrice') || '999999999')
    const sort = searchParams.get('sort') || 'popular'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    const conditions: Record<string, unknown>[] = [{ isActive: true }]

    // Full text search on name, brand, description (only if query is provided)
    if (q.trim()) {
      conditions.push({
        OR: [
          { name: { contains: q } },
          { brand: { contains: q } },
          { description: { contains: q } },
        ],
      })
    }

    // Category filter
    if (category) {
      conditions.push({ category: { slug: category } })
    }

    // Brand filter (comma-separated)
    if (brand) {
      const brands = brand.split(',').map(b => b.trim()).filter(Boolean)
      if (brands.length === 1) {
        conditions.push({ brand: brands[0] })
      } else if (brands.length > 1) {
        conditions.push({ brand: { in: brands } })
      }
    }

    // Minimum rating filter
    if (minRating > 0) {
      conditions.push({ rating: { gte: minRating } })
    }

    // In stock filter
    if (inStock) {
      conditions.push({ stock: { gt: 0 } })
    }

    // On sale filter (has originalPriceGNF)
    if (onSale) {
      conditions.push({ originalPriceGNF: { not: null } })
    }

    // Price range filter
    if (minPrice > 0 || maxPrice < 999999999) {
      conditions.push({ priceGNF: { gte: minPrice, lte: maxPrice } })
    }

    const where = conditions.length === 1 ? conditions[0] : { AND: conditions }

    // Sorting
    let orderBy: Record<string, string> = { salesCount: 'desc' }
    switch (sort) {
      case 'price_asc':
        orderBy = { priceGNF: 'asc' }
        break
      case 'price_desc':
        orderBy = { priceGNF: 'desc' }
        break
      case 'rating':
        orderBy = { rating: 'desc' }
        break
      case 'popular':
        orderBy = { salesCount: 'desc' }
        break
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' }
        break
    }

    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: { category: true },
        orderBy,
        skip,
        take: limit,
      }),
      db.product.count({ where }),
    ])

    // Compute available brands from all matching products (for filter sidebar)
    const allBrands = await db.product.groupBy({
      by: ['brand'],
      where: { isActive: true, ...(q.trim() ? { OR: [{ name: { contains: q } }, { brand: { contains: q } }, { description: { contains: q } }] } : {}) },
      _count: { brand: true },
      orderBy: { _count: { brand: 'desc' } },
    })

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      query: q,
      facets: {
        brands: allBrands.map(b => ({ name: b.brand, count: b._count.brand })),
      },
    })
  } catch (error) {
    console.error('Error searching products:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
