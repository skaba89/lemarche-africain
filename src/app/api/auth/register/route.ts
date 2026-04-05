import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';
import { sanitizeEmail, sanitizeString, sanitizePhone } from '@/lib/sanitize';

export async function POST(request: NextRequest) {
  // Rate limiting: 10 requests/minute for auth routes
  const { success, remaining } = rateLimit(request, 'register', 10, 60);
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
    const name = sanitizeString(body.name || '');
    const phone = body.phone ? sanitizePhone(body.phone) : null;
    const { password } = body;

    // Validation
    if (!email) {
      return NextResponse.json({ error: 'L\'adresse e-mail est requise' }, { status: 400 });
    }
    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Le nom doit contenir au moins 2 caracteres' }, { status: 400 });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 6 caracteres' }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Cette adresse e-mail est deja utilisee' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await db.user.create({
      data: {
        email,
        name,
        phone,
        password: hashedPassword,
        pointsBalance: 500,
      },
    });

    // Award signup loyalty points
    try {
      await db.loyaltyPoints.create({
        data: {
          userId: user.id,
          points: 500,
          source: 'signup',
          description: 'Bonus de bienvenue a l\'inscription',
        },
      });
    } catch {
      // Non-critical: don't fail registration
    }

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        city: user.city,
        address: user.address,
        role: user.role,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
