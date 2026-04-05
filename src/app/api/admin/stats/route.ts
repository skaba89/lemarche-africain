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
    // Validate session
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

    // Fetch all stats in parallel
    const [
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      allOrders,
      totalUsers,
      topProducts,
      recentOrdersRaw,
    ] = await Promise.all([
      db.product.count(),
      db.product.count({ where: { isActive: true } }),
      db.order.count(),
      db.order.count({ where: { status: 'pending' } }),
      db.order.findMany({ select: { totalGNF: true } }),
      db.user.count(),
      db.product.findMany({
        orderBy: { salesCount: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          brand: true,
          priceGNF: true,
          stock: true,
          salesCount: true,
          images: true,
          slug: true,
          isActive: true,
        },
      }),
      db.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const totalRevenue = allOrders.reduce((sum, o) => sum + o.totalGNF, 0);

    const recentOrders = recentOrdersRaw.map((order) => {
      let parsedItems: { name: string; quantity: number }[] = [];
      try { parsedItems = JSON.parse(order.items); } catch { /* ignore */ }
      const statusInfo = STATUS_LABELS[order.status] || STATUS_LABELS.pending;

      return {
        id: order.orderNumber,
        fullName: order.fullName,
        phone: order.phone,
        date: order.createdAt.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        status: statusInfo.label,
        statusColor: statusInfo.color,
        statusRaw: order.status,
        total: order.totalGNF.toLocaleString('fr-FR') + ' GNF',
        itemCount: parsedItems.reduce((sum, i) => sum + i.quantity, 0),
      };
    });

    const topProductsFormatted = topProducts.map((p) => {
      let images: string[] = [];
      try { images = JSON.parse(p.images); } catch { /* ignore */ }
      return {
        id: p.id,
        name: p.name,
        brand: p.brand,
        priceGNF: p.priceGNF,
        stock: p.stock,
        salesCount: p.salesCount,
        image: images[0] || null,
        slug: p.slug,
        isActive: p.isActive,
      };
    });

    return NextResponse.json({
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      totalRevenue,
      totalUsers,
      recentOrders,
      topProducts: topProductsFormatted,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
