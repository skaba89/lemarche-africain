import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';
import { validateSession } from '../login/route';
import { sanitizeEmail } from '@/lib/sanitize';

export async function POST(request: NextRequest) {
  // Rate limiting: 3 requests/hour (very sensitive operation)
  const { success, remaining } = rateLimit(request, 'admin-promote', 3, 3600);
  if (!success) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Reessayez plus tard.' },
      { status: 429, headers: { 'X-RateLimit-Remaining': String(remaining) } }
    );
  }

  try {
    // 1. Authenticate the requesting user
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

    // 2. Check if the requesting user is already an admin
    const requestingUser = await db.user.findUnique({
      where: { id: session.userId },
      select: { role: true },
    });

    if (!requestingUser || requestingUser.role !== 'admin') {
      return NextResponse.json({ error: 'Acces refuse. Seuls les administrateurs peuvent promouvoir des utilisateurs.' }, { status: 403 });
    }

    // 3. Validate target email
    const body = await request.json();
    const email = sanitizeEmail(body.email || '');

    if (!email) {
      return NextResponse.json({ error: 'E-mail requis' }, { status: 400 });
    }

    // 4. Prevent self-promotion
    if (session.userId === email.toLowerCase().trim()) {
      // Use email lookup to compare properly
      const selfUser = await db.user.findUnique({ where: { email } });
      if (selfUser && selfUser.id === session.userId) {
        return NextResponse.json({ error: 'Auto-promotion non autorisee' }, { status: 400 });
      }
    }

    const targetUser = await db.user.findUnique({
      where: { email },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Utilisateur non trouve' }, { status: 404 });
    }

    if (targetUser.role === 'admin') {
      return NextResponse.json({ error: 'Cet utilisateur est deja administrateur' }, { status: 400 });
    }

    const updated = await db.user.update({
      where: { id: targetUser.id },
      data: { role: 'admin' },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        city: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user: updated, message: 'Utilisateur promu administrateur' });
  } catch (error) {
    console.error('Promote error:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
