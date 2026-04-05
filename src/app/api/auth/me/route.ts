import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateSession } from '../login/route';

export async function GET(request: NextRequest) {
  try {
    // Read token from cookie or Authorization header
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

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouve' }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
