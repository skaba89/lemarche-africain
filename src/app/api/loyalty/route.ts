import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateSession } from '@/app/api/auth/login/route';

// Helper: get authenticated user from request
async function getAuthUser(request: NextRequest) {
  const cookieToken = request.cookies.get('le-marche-token')?.value;
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const token = cookieToken || bearerToken;

  if (!token) return null;

  const session = validateSession(token);
  if (!session) return null;

  return db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      city: true,
      address: true,
      role: true,
      pointsBalance: true,
      createdAt: true,
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
    }

    // Fetch last 10 points transactions
    const history = await db.loyaltyPoints.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        points: true,
        source: true,
        description: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      balance: user.pointsBalance,
      history: history.map((h) => ({
        points: h.points,
        source: h.source,
        description: h.description,
        date: h.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Loyalty GET error:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
