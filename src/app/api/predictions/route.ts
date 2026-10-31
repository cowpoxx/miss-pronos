import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { predictionSchema } from '@/lib/validation'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')
    const editionId = searchParams.get('editionId')

    if (!groupId || !editionId) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    // Vérifier que l'utilisateur est membre du groupe
    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: session.user.id } },
    })
    if (!membership) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const prediction = await prisma.prediction.findUnique({
      where: { groupId_userId_editionId: { groupId, userId: session.user.id, editionId } },
    })

    return NextResponse.json({ prediction })
  } catch (error) {
    console.error('GET prediction error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = predictionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 })
    }

    const { groupId, editionId, winnerId, top5, favorites } = parsed.data

    // Vérifier membership
    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: session.user.id } },
      include: { group: { include: { edition: true } } },
    })
    if (!membership) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Vérifier verrouillage
    const now = new Date()
    if (membership.group.edition.startDate <= now) {
      return NextResponse.json({ error: 'Les pronostics sont verrouillés' }, { status: 400 })
    }

    // Upsert prediction
    const prediction = await prisma.prediction.upsert({
      where: { groupId_userId_editionId: { groupId, userId: session.user.id, editionId } },
      create: {
        groupId,
        userId: session.user.id,
        editionId,
        winnerId,
        top5,
        favorites,
      },
      update: {
        winnerId,
        top5,
        favorites,
        submittedAt: new Date(),
      },
    })

    return NextResponse.json({ prediction })
  } catch (error) {
    console.error('POST prediction error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}