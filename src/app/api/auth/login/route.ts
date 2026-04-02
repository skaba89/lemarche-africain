import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';
import { rateLimit } from '@/lib/rate-limit';
import { sanitizeEmail } from '@/lib/sanitize';

// Simple in-memory token store (for production, use Redis or DB table)
const sessions = new Map<string, { userId: string; token: string; createdAt: number }>();

// Session expiry: 7 days
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export interface SessionData {
  userId: string;
  token: string;
}

export function validateSession(token: string): SessionData | null {
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() - session.createdAt > SESSION_MAX_AGE) {
    sessions.delete(token);
    return null;
  }
  return session;
}

export function destroySession(token: string): void {
  sessions.delete(token);
}

export async function POST(request: NextRequest) {
  // Rate limiting: 10 requests/minute for auth routes
  const { success, remaining } = rateLimit(request, 'login', 10, 60);
  if (!success) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Réessayez dans une minute.' },
      { status: 429, headers: { 'X-RateLimit-Remaining': String(remaining) } }
    );
  }

  // Content-Type validation
  const contentType = request.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return NextResponse.json(
      { error: 'En-tête Content-Type application/json requis.' },
      { status: 415 }
    );
  }

  try {
    const body = await request.json();
    const email = sanitizeEmail(body.email || '');
    const { password } = body;

    if (!email) {
      return NextResponse.json({ error: 'E-mail et mot de passe requis' }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ error: 'E-mail et mot de passe requis' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 });
    }

    // Create session token
    const token = randomUUID();
    sessions.set(token, { userId: user.id, token, createdAt: Date.now() });

    // Set HTTP-only cookie
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        city: user.city,
        address: user.address,
        role: user.role,
      },
      token,
    });

    response.cookies.set('le-marche-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
