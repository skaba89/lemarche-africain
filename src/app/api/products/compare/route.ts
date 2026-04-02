import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const idsParam = searchParams.get('ids')

    if (!idsParam) {
      return NextResponse.json(
        { error: 'Le paramètre ids est requis' },
        { status: 400 }
      )
    }

    const ids = idsParam.split(',').filter(Boolean).map((id) => id.trim())

    if (ids.length === 0) {
      return NextResponse.json(
        { error: 'Aucun identifiant de produit fourni' },
        { status: 400 }
      )
    }

    if (ids.length > 4) {
      return NextResponse.json(
        { error: 'Vous ne pouvez comparer que 4 produits maximum' },
        { status: 400 }
      )
    }

    const products = await db.product.findMany({
      where: {
        id: { in: ids },
        isActive: true,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error comparing products:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
