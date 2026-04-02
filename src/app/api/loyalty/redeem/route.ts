import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateSession } from '@/app/api/auth/login/route';
import { randomUUID } from 'crypto';
import { rateLimit } from '@/lib/rate-limit';

// Conversion: 1000 points = 10 000 GNF
const POINTS_PER_REDEMPTION = 1000;
const GNF_PER_REDEMPTION = 10000;

export async function POST(request: NextRequest) {
  // Rate limiting
  const { success, remaining } = rateLimit(request, 'loyalty-redeem', 5, 60);
  if (!success) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Reessayez dans une minute.' },
      { status: 429, headers: { 'X-RateLimit-Remaining': String(remaining) } }
    );
  }

  try {
    // Authenticate user
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

    const body = await request.json();
    const { points } = body;

    // Validate points
    if (!points || typeof points !== 'number' || points < POINTS_PER_REDEMPTION) {
      return NextResponse.json(
        { error: `Minimum ${POINTS_PER_REDEMPTION} points requis pour un echange` },
        { status: 400 }
      );
    }

    // Round down to nearest 1000
    const redeemablePoints = Math.floor(points / POINTS_PER_REDEMPTION) * POINTS_PER_REDEMPTION;

    if (redeemablePoints < POINTS_PER_REDEMPTION) {
      return NextResponse.json(
        { error: `Minimum ${POINTS_PER_REDEMPTION} points requis pour un echange` },
        { status: 400 }
      );
    }

    // Get user with balance
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { id: true, pointsBalance: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouve' }, { status: 404 });
    }

    if (user.pointsBalance < redeemablePoints) {
      return NextResponse.json(
        { error: `Solde insuffisant. Vous avez ${user.pointsBalance} points.` },
        { status: 400 }
      );
    }

    // Calculate discount
    const discountGNF = (redeemablePoints / POINTS_PER_REDEMPTION) * GNF_PER_REDEMPTION;

    // Generate unique coupon code
    const couponCode = `FID-${randomUUID().substring(0, 8).toUpperCase()}`;

    // Create coupon
    await db.coupon.create({
      data: {
        code: couponCode,
        label: `Reduction fidelite - ${redeemablePoints} points`,
        discountType: 'fixed',
        discountValue: discountGNF,
        minOrderGNF: 0,
        maxUses: 1,
        usedCount: 0,
        isActive: true,
      },
    });

    // Deduct points and create transaction
    await db.user.update({
      where: { id: user.id },
      data: { pointsBalance: { decrement: redeemablePoints } },
    });

    await db.loyaltyPoints.create({
      data: {
        userId: user.id,
        points: -redeemablePoints,
        source: 'redemption',
        description: `Echange de ${redeemablePoints} points contre ${discountGNF.toLocaleString('fr-FR')} GNF`,
      },
    });

    return NextResponse.json({
      success: true,
      couponCode,
      discountGNF,
      pointsRedeemed: redeemablePoints,
      newBalance: user.pointsBalance - redeemablePoints,
      message: `${discountGNF.toLocaleString('fr-FR')} GNF de reduction appliques ! Code : ${couponCode}`,
    });
  } catch (error) {
    console.error('Loyalty redeem error:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
