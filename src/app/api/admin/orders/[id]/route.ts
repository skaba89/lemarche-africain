import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateSession } from '@/app/api/auth/login/route';

const VALID_STATUSES = ['pending', 'confirmed', 'preparing', 'shipping', 'delivered', 'cancelled'];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Statut invalide. Valeurs autorisees : ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const existing = await db.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Commande non trouvee' }, { status: 404 });
    }

    const updated = await db.order.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      id: updated.id,
      orderNumber: updated.orderNumber,
      status: updated.status,
    });
  } catch (error) {
    console.error('Admin order update error:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
