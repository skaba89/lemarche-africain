import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { BUSINESS } from '@/lib/constants'
import { rateLimit } from '@/lib/rate-limit'
import { validateSession } from '@/app/api/auth/login/route'

const PAYMENT_LABELS: Record<string, string> = {
  orange_money: 'Orange Money',
  mtn_momo: 'MTN MoMo',
  wave: 'Wave',
  cash: 'Cash a la livraison',
  carte: 'Carte bancaire',
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  // Rate limiting
  const { success } = rateLimit(request, 'invoice-lookup', 20, 60)
  if (!success) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Reessayez.' },
      { status: 429 }
    )
  }

  // BUG 3 FIX: Require authentication — validate session token
  const cookieToken = request.cookies.get('le-marche-token')?.value
  const authHeader = request.headers.get('authorization')
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const token = cookieToken || bearerToken

  if (!token) {
    return NextResponse.json(
      { error: 'Authentification requise' },
      { status: 401 }
    )
  }

  const session = validateSession(token)
  if (!session) {
    return NextResponse.json(
      { error: 'Session invalide ou expirée' },
      { status: 401 }
    )
  }

  try {
    const { orderNumber } = await params

    const order = await db.order.findUnique({
      where: { orderNumber },
    })

    if (!order) {
      return NextResponse.json({ error: 'Commande non trouvee' }, { status: 404 })
    }

    // BUG 3 FIX: Ownership check — if order belongs to a user, verify it's the authenticated user
    if (order.userId && order.userId !== session.userId) {
      return NextResponse.json(
        { error: 'Accès non autorisé à cette commande' },
        { status: 403 }
      )
    }

    // Parse order items
    let parsedItems: Array<{
      productId: string
      name: string
      slug: string
      price: number
      quantity: number
      color: string | null
      image: string | null
    }> = []
    try {
      parsedItems = JSON.parse(order.items)
    } catch {
      parsedItems = []
    }

    // Format invoice items
    const invoiceItems = parsedItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      total: item.price * item.quantity,
    }))

    // Calculate totals
    const subtotal = order.subtotalGNF
    const deliveryFee = order.deliveryFeeGNF
    const discount = order.couponDiscount || 0
    const total = order.totalGNF

    // Payment method label
    const paymentLabel = PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod

    // Format date
    const invoiceDate = order.createdAt.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    // Build response
    const invoice = {
      invoiceNumber: `FAC-${order.orderNumber}`,
      invoiceDate,
      orderNumber: order.orderNumber,
      orderDate: invoiceDate,
      // Business info
      business: {
        name: BUSINESS.name,
        address: `${BUSINESS.capital}, ${BUSINESS.country}`,
        phone: BUSINESS.phoneDisplay,
        email: BUSINESS.email,
      },
      // Customer info
      customer: {
        name: order.fullName,
        phone: order.phone,
        city: order.city,
        address: order.address || '',
      },
      // Items
      items: invoiceItems,
      // Totals
      subtotal,
      deliveryFee,
      discount,
      discountLabel: order.couponLabel || '',
      total,
      // Payment & delivery
      paymentMethod: paymentLabel,
      deliveryType: order.deliveryType === 'pickup' ? 'Point de retrait' : 'Livraison a domicile',
      deliveryAddress: order.address
        ? `${order.address}, ${order.city}, ${order.country}`
        : order.city,
      // Tax info
      taxInfo: 'TVA non applicable - article 259 B du CGI',
      // Status
      status: order.status,
    }

    return NextResponse.json({ invoice })
  } catch (error) {
    console.error('Error generating invoice:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
