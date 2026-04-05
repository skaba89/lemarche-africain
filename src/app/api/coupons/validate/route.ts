import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Rate limiting: 100 requests/minute for general API
  const { success, remaining } = rateLimit(request, 'coupon-validate', 100, 60)
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
    const { code, subtotalGNF } = body

    if (!code) {
      return NextResponse.json({ valid: false, error: 'Code de coupon requis' }, { status: 400 })
    }

    const coupon = await db.coupon.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!coupon) {
      return NextResponse.json({ valid: false, error: 'Code invalide' })
    }

    if (!coupon.isActive) {
      return NextResponse.json({ valid: false, error: 'Ce coupon n\'est plus actif' })
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return NextResponse.json({ valid: false, error: 'Ce coupon a expiré' })
    }

    if (coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, error: 'Ce coupon a atteint sa limite d\'utilisation' })
    }

    if (subtotalGNF < coupon.minOrderGNF) {
      return NextResponse.json({
        valid: false,
        error: `Commande minimum de ${coupon.minOrderGNF.toLocaleString()} GNF requise`,
      })
    }

    let discount = 0
    if (coupon.discountType === 'fixed') {
      discount = coupon.discountValue
    } else if (coupon.discountType === 'percentage') {
      discount = Math.round((subtotalGNF * coupon.discountValue) / 100)
    }

    return NextResponse.json({
      valid: true,
      discount,
      type: coupon.discountType,
      label: coupon.label,
      code: coupon.code,
    })
  } catch (error) {
    console.error('Error validating coupon:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
