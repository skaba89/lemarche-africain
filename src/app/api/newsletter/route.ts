import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { rateLimit } from '@/lib/rate-limit';
import { sanitizeEmail } from '@/lib/sanitize';

const NEWSLETTER_FILE = path.join(process.cwd(), 'data', 'newsletter.json');

function readSubscribers(): string[] {
  try {
    if (fs.existsSync(NEWSLETTER_FILE)) {
      const data = fs.readFileSync(NEWSLETTER_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch {
    console.error('Error reading newsletter file');
  }
  return [];
}

function writeSubscribers(subscribers: string[]): void {
  try {
    const dir = path.dirname(NEWSLETTER_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(NEWSLETTER_FILE, JSON.stringify(subscribers, null, 2), 'utf-8');
  } catch {
    console.error('Error writing newsletter file');
  }
}

export async function POST(request: NextRequest) {
  // Rate limiting: 100 requests/minute for general API
  const { success, remaining } = rateLimit(request, 'newsletter', 100, 60);
  if (!success) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Réessayez dans une minute.' },
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

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Adresse email requise.' },
        { status: 400 }
      );
    }

    const subscribers = readSubscribers();

    if (subscribers.includes(email)) {
      return NextResponse.json(
        { success: true, message: 'Vous etes deja inscrit a notre newsletter !' },
        { status: 200 }
      );
    }

    subscribers.push(email);
    writeSubscribers(subscribers);

    return NextResponse.json(
      {
        success: true,
        message:
          'Merci pour votre inscription ! Vous recevrez bientot nos meilleures offres.',
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: 'Une erreur est survenue. Veuillez reessayer.' },
      { status: 500 }
    );
  }
}
