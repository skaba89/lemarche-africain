import { NextRequest, NextResponse } from 'next/server';
import { destroySession } from '../login/route';

export async function POST(request: NextRequest) {
  try {
    // Read token from cookie
    const token = request.cookies.get('le-marche-token')?.value;

    if (token) {
      destroySession(token);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set('le-marche-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
