import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeString, sanitizePhone } from '@/lib/sanitize'
import { validateSession } from '@/app/api/auth/login/route'

// Custom error for transaction-validation failures (maps to 400)
class OrderValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OrderValidationError'
  }
}

// Centralized delivery fee logic matching frontend
function getDeliveryFee(subtotalGNF: number, deliveryType: string): number {
  if (subtotalGNF === 0) return 0;
  if (deliveryType === 'pickup') return 0;
  if (subtotalGNF >= 5000000) return 0;
  return 15000;
}

// Status labels in French
const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'bg-gray-500 text-white' },
  confirmed: { label: 'Confirmé', color: 'bg-blue-500 text-white' },
  preparing: { label: 'En préparation', color: 'bg-indigo-500 text-white' },
  shipping: { label: 'En livraison', color: 'bg-[#FF8F00] text-white' },
  delivered: { label: 'Livré', color: 'bg-[#2E7D32] text-white' },
  cancelled: { label: 'Annulé', color: 'bg-[#B12704] text-white' },
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    if (!phone || phone.trim().length < 3) {
      return NextResponse.json(
        { error: 'Veuillez entrer un numéro de téléphone valide (min. 3 caractères).' },
        { status: 400 }
      )
    }

    const where = {
      phone: { contains: phone.trim() },
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.order.count({ where }),
    ])

    // Format orders for the frontend
    const formatted = orders.map((order) => {
      let parsedItems: { name: string; quantity: number }[] = []
      try { parsedItems = JSON.parse(order.items) } catch { /* ignore */ }

      const statusInfo = STATUS_LABELS[order.status] || STATUS_LABELS.pending

      return {
        id: order.orderNumber,
        date: order.createdAt.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        status: statusInfo.label,
        statusColor: statusInfo.color,
        total: order.totalGNF.toLocaleString('fr-FR') + ' GNF',
        items: parsedItems.reduce((sum, i) => sum + i.quantity, 0),
        product: parsedItems.map((i) => i.name).join(' + ') || 'Commande',
        rawTotal: order.totalGNF,
      }
    })

    return NextResponse.json({
      orders: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Rate limiting: 5 requests/minute for order creation
  const { success, remaining } = rateLimit(request, 'order-create', 5, 60)
  if (!success) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Réessayez dans une minute.' },
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
    // BUG 1 FIX: Do NOT trust client-provided couponDiscount / couponLabel.
    // Only accept couponCode; we re-validate and compute the discount server-side.
    const { items, deliveryType, paymentMethod, couponCode, userId } = body
    const fullName = sanitizeString(body.fullName || '')
    const phone = sanitizePhone(body.phone || '')
    const city = sanitizeString(body.city || '')
    const address = body.address ? sanitizeString(body.address) : null
    const notes = body.notes ? sanitizeString(body.notes) : null

    // Validate required fields
    if (!items || !items.length || !fullName || !phone || !city || !paymentMethod) {
      return NextResponse.json(
        { error: 'Données manquantes. Veuillez remplir tous les champs obligatoires.' },
        { status: 400 }
      )
    }

    // BUG 2 FIX: Wrap the entire order creation in a Prisma transaction
    // so that stock checks, decrements, coupon validation, and order.create
    // are atomic — preventing race-condition overselling.
    const order = await db.$transaction(async (tx) => {
      // ---- Validate items & compute subtotal ----
      let subtotalGNF = 0
      const validatedItems: Array<{
        productId: string
        name: string
        slug: string
        price: number
        quantity: number
        color: string | null
        image: string | null
      }> = []

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        })

        if (!product) {
          throw new OrderValidationError(`Produit ${item.productId} non trouvé`)
        }

        if (!product.isActive) {
          throw new OrderValidationError(`Le produit ${product.name} n'est plus disponible`)
        }

        if (product.stock < item.quantity) {
          throw new OrderValidationError(
            `Stock insuffisant pour ${product.name}. Disponible: ${product.stock}`
          )
        }

        subtotalGNF += product.priceGNF * item.quantity
        validatedItems.push({
          productId: product.id,
          name: product.name,
          slug: product.slug,
          price: product.priceGNF,
          quantity: item.quantity,
          color: item.color || null,
          image: product.images ? JSON.parse(product.images)[0] : null,
        })
      }

      // ---- Delivery fee ----
      const deliveryFeeGNF = getDeliveryFee(subtotalGNF, deliveryType || 'pickup')

      // ---- BUG 1 FIX: Server-side coupon re-validation ----
      let discountGNF = 0
      let couponLabel: string | null = null

      if (couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: couponCode },
        })

        if (!coupon) {
          throw new OrderValidationError('Code promo invalide')
        }
        if (!coupon.isActive) {
          throw new OrderValidationError('Ce code promo n\'est plus actif')
        }
        if (coupon.expiresAt && coupon.expiresAt < new Date()) {
          throw new OrderValidationError('Ce code promo a expiré')
        }
        if (coupon.usedCount >= coupon.maxUses) {
          throw new OrderValidationError('Ce code promo a atteint sa limite d\'utilisation')
        }
        if (subtotalGNF < coupon.minOrderGNF) {
          throw new OrderValidationError(
            `Commande minimum de ${coupon.minOrderGNF.toLocaleString('fr-FR')} GNF requise pour ce code promo`
          )
        }

        // Calculate actual discount based on coupon type
        if (coupon.discountType === 'percentage') {
          discountGNF = Math.floor(subtotalGNF * coupon.discountValue / 100)
        } else {
          discountGNF = coupon.discountValue
        }

        // Cap discount so total can never go below 0
        discountGNF = Math.min(discountGNF, subtotalGNF)
        couponLabel = coupon.label

        // Increment coupon usage count (atomic within this transaction)
        await tx.coupon.update({
          where: { code: couponCode },
          data: { usedCount: { increment: 1 } },
        })
      }

      const totalGNF = subtotalGNF + deliveryFeeGNF - discountGNF

      // ---- Generate order number ----
      const orderNumber = `LMA-${Math.random().toString(36).substring(2, 10).toUpperCase()}`

      // ---- Create order ----
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          items: JSON.stringify(validatedItems),
          subtotalGNF,
          deliveryFeeGNF,
          totalGNF,
          status: 'pending',
          paymentMethod,
          deliveryType: deliveryType || 'pickup',
          fullName,
          phone,
          city,
          address: address || null,
          notes: notes || null,
          couponDiscount: discountGNF > 0 ? discountGNF : null,
          couponLabel,
          couponCode: couponCode || null,
          ...(userId ? { userId } : {}),
        },
      })

      // ---- Update stock (atomic within transaction) ----
      for (const item of validatedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      }

      // ---- Award loyalty points if user is authenticated ----
      if (userId) {
        try {
          const points = Math.floor(totalGNF / 1000)
          if (points > 0) {
            await tx.loyaltyPoints.create({
              data: {
                userId,
                points,
                source: 'purchase',
                description: `Points gagnes pour la commande ${orderNumber} (${totalGNF.toLocaleString('fr-FR')} GNF)`,
                orderId: newOrder.id,
              },
            })
            await tx.user.update({
              where: { id: userId },
              data: { pointsBalance: { increment: points } },
            })
          }
        } catch (pointsError) {
          console.error('Error awarding loyalty points:', pointsError)
        }
      }

      return newOrder
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    // Distinguish validation errors (400) from internal errors (500)
    if (error instanceof OrderValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
