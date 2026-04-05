import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { db } from '@/lib/db'

const DATA_FILE = path.join(process.cwd(), 'data', 'stock-notifications.json')

interface StockNotificationEntry {
  productId: string
  email: string
  createdAt: string
}

async function readNotifications(): Promise<StockNotificationEntry[]> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function writeNotifications(notifications: StockNotificationEntry[]): Promise<void> {
  const dir = path.dirname(DATA_FILE)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(notifications, null, 2), 'utf-8')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, email } = body

    // Validate productId
    if (!productId || typeof productId !== 'string') {
      return NextResponse.json({ error: 'Identifiant produit requis' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Adresse email invalide' }, { status: 400 })
    }

    // Check product exists
    const product = await db.product.findUnique({
      where: { id: productId },
    })
    if (!product) {
      return NextResponse.json({ error: 'Produit non trouv\u00e9' }, { status: 404 })
    }

    // Read existing notifications
    const notifications = await readNotifications()

    // Check for duplicate (same productId + email)
    const existing = notifications.find(
      (n) => n.productId === productId && n.email === email.toLowerCase().trim()
    )
    if (existing) {
      return NextResponse.json({ success: true, message: 'D\u00e9j\u00e0 inscrit \u00e0 la notification' })
    }

    // Add notification
    const entry: StockNotificationEntry = {
      productId,
      email: email.toLowerCase().trim(),
      createdAt: new Date().toISOString(),
    }
    notifications.push(entry)
    await writeNotifications(notifications)

    return NextResponse.json({ success: true, message: 'Notification enregistr\u00e9e' }, { status: 201 })
  } catch (error) {
    console.error('Error in stock notification:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
