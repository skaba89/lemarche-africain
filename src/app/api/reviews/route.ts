import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeString } from '@/lib/sanitize'
import { validateSession } from '@/app/api/auth/login/route'

// ============================================================
// POST /api/reviews — Create a new review
// ============================================================

export async function POST(request: NextRequest) {
  // Rate limiting: 100 requests/minute for general API
  const { success, remaining } = rateLimit(request, 'review-create', 100, 60)
  if (!success) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Réessayez dans une minute.' },
      { status: 429, headers: { 'X-RateLimit-Remaining': String(remaining) } }
    )
  }

  // Content-Type validation
  const contentType = request.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    return NextResponse.json(
      { error: 'En-tête Content-Type application/json requis.' },
      { status: 415 }
    )
  }

  try {
    const body = await request.json()
    const { productId, rating } = body
    const author = sanitizeString(body.author || '')
    const title = sanitizeString(body.title || '')
    const reviewBody = sanitizeString(body.body || '')
    const location = body.location ? sanitizeString(body.location) : null
    const userId = body.userId || null

    // Validate required fields
    if (!productId) {
      return NextResponse.json({ error: 'Produit requis' }, { status: 400 })
    }
    if (!author || author.length === 0) {
      return NextResponse.json({ error: 'Nom de l\'auteur requis' }, { status: 400 })
    }
    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'La note doit \u00eatre entre 1 et 5' }, { status: 400 })
    }
    if (!title || title.length === 0) {
      return NextResponse.json({ error: 'Titre requis' }, { status: 400 })
    }
    if (!reviewBody || reviewBody.length === 0) {
      return NextResponse.json({ error: 'Commentaire requis' }, { status: 400 })
    }

    // Verify product exists
    const product = await db.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json({ error: 'Produit non trouv\u00e9' }, { status: 404 })
    }

    // Create the review
    const review = await db.review.create({
      data: {
        productId,
        author,
        rating: Math.round(rating),
        title,
        body: reviewBody,
        location,
        verified: false,
      },
    })

    // Recalculate product rating average
    const allReviews = await db.review.findMany({
      where: { productId },
      select: { rating: true },
    })

    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0)
    const averageRating = totalRating / allReviews.length

    await db.product.update({
      where: { id: productId },
      data: {
        rating: Math.round(averageRating * 10) / 10,
        ratingCount: allReviews.length,
      },
    })

    // Award loyalty points if user is authenticated
    if (userId) {
      try {
        await db.loyaltyPoints.create({
          data: {
            userId,
            points: 200,
            source: 'review',
            description: `Points gagnes pour un avis sur le produit ${product.name}`,
          },
        })
        await db.user.update({
          where: { id: userId },
          data: { pointsBalance: { increment: 200 } },
        })
      } catch (pointsError) {
        console.error('Error awarding review loyalty points:', pointsError)
      }
    }

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

// ============================================================
// GET /api/reviews?productId=xxx — Fetch paginated reviews
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    if (!productId) {
      return NextResponse.json({ error: 'Produit requis' }, { status: 400 })
    }

    const skip = (page - 1) * limit

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where: { productId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.review.count({
        where: { productId },
      }),
    ])

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
