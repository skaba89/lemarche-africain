import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { validateSession } from '@/app/api/auth/login/route'

// ============================================================
// Status mapping for timeline
// ============================================================

const STATUS_ORDER = ['pending', 'confirmed', 'preparing', 'shipping', 'delivered']

const STATUS_LABELS: Record<string, string> = {
  pending: 'Commande pass\u00e9e',
  confirmed: 'Confirm\u00e9e',
  preparing: 'En pr\u00e9paration',
  shipping: 'En livraison',
  delivered: 'Livr\u00e9e',
  cancelled: 'Annul\u00e9e',
}

function generateStatusHistory(
  currentStatus: string,
  createdAt: Date
): Array<{ status: string; label: string; date: string }> {
  const history: Array<{ status: string; label: string; date: string }> = []
  const created = new Date(createdAt)

  if (currentStatus === 'cancelled') {
    // For cancelled orders, show pending + cancelled
    history.push({
      status: 'pending',
      label: STATUS_LABELS.pending,
      date: created.toISOString(),
    })
    // Cancelled 1 day after
    const cancelledDate = new Date(created)
    cancelledDate.setDate(cancelledDate.getDate() + 1)
    cancelledDate.setHours(14, 30, 0, 0)
    history.push({
      status: 'cancelled',
      label: STATUS_LABELS.cancelled,
      date: cancelledDate.toISOString(),
    })
    return history
  }

  // For normal flow, generate timestamps for each step up to current status
  const currentIndex = STATUS_ORDER.indexOf(currentStatus)

  for (let i = 0; i <= currentIndex; i++) {
    const status = STATUS_ORDER[i]
    const stepDate = new Date(created)

    if (i === 0) {
      // Order placed at creation time
      stepDate.setHours(10, 15, 0, 0)
    } else if (i === 1) {
      // Confirmed ~30 min after
      stepDate.setHours(stepDate.getHours() + 0, stepDate.getMinutes() + 30)
    } else if (i === 2) {
      // Preparing next day
      stepDate.setDate(stepDate.getDate() + 1)
      stepDate.setHours(8, 0, 0, 0)
    } else if (i === 3) {
      // Shipping day after
      stepDate.setDate(stepDate.getDate() + 2)
      stepDate.setHours(7, 30, 0, 0)
    } else if (i === 4) {
      // Delivered 3 days after
      stepDate.setDate(stepDate.getDate() + 3)
      stepDate.setHours(14, 0, 0, 0)
    }

    history.push({
      status,
      label: STATUS_LABELS[status],
      date: stepDate.toISOString(),
    })
  }

  return history
}

function getEstimatedDelivery(createdAt: Date): string {
  const date = new Date(createdAt)
  date.setDate(date.getDate() + 3)
  return date.toISOString()
}

// ============================================================
// GET /api/orders/[orderNumber] — Fetch order with status history
// ============================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  // Rate limiting for order lookups
  const { success } = rateLimit(request, 'order-lookup', 30, 60)
  if (!success) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Reessayez dans une minute.' },
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
      return NextResponse.json({ error: 'Commande non trouv\u00e9e' }, { status: 404 })
    }

    // BUG 3 FIX: Ownership check — if order belongs to a user, verify it's the authenticated user
    if (order.userId && order.userId !== session.userId) {
      return NextResponse.json(
        { error: 'Accès non autorisé à cette commande' },
        { status: 403 }
      )
    }

    // Generate fake status history based on order status and creation date
    const statusHistory = generateStatusHistory(order.status, order.createdAt)
    const estimatedDelivery = getEstimatedDelivery(order.createdAt)

    return NextResponse.json({
      order,
      statusHistory,
      estimatedDelivery,
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
