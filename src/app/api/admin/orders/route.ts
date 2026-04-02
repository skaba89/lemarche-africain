import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateSession } from '@/app/api/auth/login/route';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'bg-gray-500 text-white' },
  confirmed: { label: 'Confirmé', color: 'bg-blue-500 text-white' },
  preparing: { label: 'En préparation', color: 'bg-indigo-500 text-white' },
  shipping: { label: 'En livraison', color: 'bg-[#FF8F00] text-white' },
  delivered: { label: 'Livré', color: 'bg-[#2E7D32] text-white' },
  cancelled: { label: 'Annulé', color: 'bg-[#B12704] text-white' },
};

export async function GET(request: NextRequest) {
  try {
    // Validate session & admin role
    const cookieToken = request.cookies.get('le-marche-token')?.value;
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const token = cookieToken || bearerToken;

    if (!token) {
      return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
    }

    const session = validateSession(token);
    if (!session) {
      return NextResponse.json({ error: 'Session expiree' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { role: true },
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { phone: { contains: search } },
        { fullName: { contains: search } },
        { orderNumber: { contains: search } },
      ];
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.order.count({ where }),
    ]);

    const formatted = orders.map((order) => {
      let parsedItems: { name: string; quantity: number; price: number }[] = [];
      try { parsedItems = JSON.parse(order.items); } catch { /* ignore */ }
      const statusInfo = STATUS_LABELS[order.status] || STATUS_LABELS.pending;

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        fullName: order.fullName,
        phone: order.phone,
        city: order.city,
        address: order.address,
        date: order.createdAt.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        status: statusInfo.label,
        statusColor: statusInfo.color,
        statusRaw: order.status,
        paymentMethod: order.paymentMethod,
        deliveryType: order.deliveryType,
        subtotalGNF: order.subtotalGNF,
        deliveryFeeGNF: order.deliveryFeeGNF,
        totalGNF: order.totalGNF,
        total: order.totalGNF.toLocaleString('fr-FR') + ' GNF',
        items: parsedItems,
        itemCount: parsedItems.reduce((sum, i) => sum + i.quantity, 0),
        couponCode: order.couponCode,
        couponDiscount: order.couponDiscount,
        notes: order.notes,
      };
    });

    return NextResponse.json({
      orders: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin orders error:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
