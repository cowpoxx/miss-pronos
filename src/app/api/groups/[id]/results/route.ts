import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const groupId = id
    const body = await request.json()
    const { winnerId, top5 } = body

    // Vérifier admin
    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: session.user.id } },
      include: { group: { include: { edition: true } } },
    })

    if (!membership || (membership.role !== 'admin' && membership.group.createdById !== session.user.id)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Vérifier que les candidates existent
    const candidateIds = [winnerId, ...top5].filter(Boolean)
    const candidates = await prisma.candidate.findMany({
      where: { id: { in: candidateIds }, editionId: membership.group.editionId },
    })
    if (candidates.length !== candidateIds.length) {
      return NextResponse.json({ error: 'Certaines candidates n\'existent pas' }, { status: 400 })
    }
    if (top5.length !== 5) {
      return NextResponse.json({ error: 'Le Top 5 doit contenir exactement 5 candidates' }, { status: 400 })
    }

    // Upsert official result
    const officialResult = await prisma.officialResult.upsert({
      where: { editionId: membership.group.editionId },
      create: {
        editionId: membership.group.editionId,
        winnerId,
        top5,
        enteredById: session.user.id,
      },
      update: {
        winnerId,
        top5,
        enteredById: session.user.id,
        enteredAt: new Date(),
      },
    })

    return NextResponse.json({ officialResult })
  } catch (error) {
    console.error('Save results error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}