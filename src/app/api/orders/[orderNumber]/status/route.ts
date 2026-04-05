import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { validateSession } from '@/app/api/auth/login/route'

const VALID_STATUSES = ['pending', 'confirmed', 'preparing', 'shipping', 'delivered', 'cancelled']

// ============================================================
// PATCH /api/orders/[orderNumber]/status — Update order status
// ============================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  // Rate limiting: 5 requests/minute for order operations
  const { success, remaining } = rateLimit(request, 'order-status', 5, 60)
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
    const { orderNumber } = await params
    const body = await request.json()
    const { status } = body

    if (!status || typeof status !== 'string') {
      return NextResponse.json({ error: 'Statut requis' }, { status: 400 })
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Statut invalide. Valeurs acceptées : ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }

    // Auth check: only admins can update order status
    const cookieToken = request.cookies.get('le-marche-token')?.value
    const authHeader = request.headers.get('authorization')
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    const token = cookieToken || bearerToken

    if (!token) {
      return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })
    }

    const session = validateSession(token)
    if (!session) {
      return NextResponse.json({ error: 'Session expiree' }, { status: 401 })
    }

    const requestingUser = await db.user.findUnique({
      where: { id: session.userId },
      select: { role: true },
    })

    if (!requestingUser || requestingUser.role !== 'admin') {
      return NextResponse.json({ error: 'Acces refuse. Admin uniquement.' }, { status: 403 })
    }

    const order = await db.order.findUnique({
      where: { orderNumber },
    })

    if (!order) {
      return NextResponse.json({ error: 'Commande non trouv\u00e9e' }, { status: 404 })
    }

    const updatedOrder = await db.order.update({
      where: { orderNumber },
      data: { status },
    })

    return NextResponse.json({ order: updatedOrder })
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
