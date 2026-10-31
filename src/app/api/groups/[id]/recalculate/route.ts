import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { calculateAllScores } from '@/lib/scoring'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { groupId } = await request.json()

    // Vérifier admin
    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: session.user.id } },
      include: { group: { include: { edition: { include: { officialResult: true } } } } },
    })

    if (!membership || (membership.role !== 'admin' && membership.group.createdById !== session.user.id)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const group = membership.group
    const edition = group.edition
    const officialResult = edition.officialResult
    const scoringRules = group.scoringRules
    if (!officialResult) {
      return NextResponse.json({ error: 'Aucun résultat officiel défini' }, { status: 400 })
    }

    // Récupérer tous les pronostics
    const predictions = await prisma.prediction.findMany({
      where: { groupId, editionId: edition.id },
      select: { id: true, userId: true, winnerId: true, top5: true, favorites: true },
    })

    const normalizeIds = (value: unknown): string[] =>
      Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : []
    const safePredictions = predictions.map(prediction => ({
      ...prediction,
      top5: normalizeIds(prediction.top5),
      favorites: normalizeIds(prediction.favorites),
    }))
    const safeOfficialResult = {
      ...officialResult,
      top5: normalizeIds(officialResult.top5),
    }

    // Calculer les scores
    const scores = calculateAllScores(safePredictions, safeOfficialResult, scoringRules as any)

    // Sauvegarder en base
    await prisma.$transaction(
      scores.map(s => 
        prisma.score.upsert({
          where: { groupId_userId_editionId: { groupId, userId: s.userId, editionId: edition.id } },
          create: {
            groupId,
            userId: s.userId,
            editionId: edition.id,
            totalPoints: s.total,
            breakdown: {
              winnerExact: s.winnerExact,
              top5Contains: s.top5Contains,
              top5ExactPosition: s.top5ExactPosition,
              favoriteBonus: s.favoriteBonus,
              perfectTop5Bonus: s.perfectTop5Bonus,
            },
          },
          update: {
            totalPoints: s.total,
            breakdown: {
              winnerExact: s.winnerExact,
              top5Contains: s.top5Contains,
              top5ExactPosition: s.top5ExactPosition,
              favoriteBonus: s.favoriteBonus,
              perfectTop5Bonus: s.perfectTop5Bonus,
            },
            calculatedAt: new Date(),
          },
        })
      )
    )

    // Verrouiller les pronostics
    await prisma.prediction.updateMany({
      where: { groupId, editionId: edition.id, lockedAt: null },
      data: { lockedAt: new Date() },
    })

    return NextResponse.json({ success: true, count: scores.length })
  } catch (error) {
    console.error('Recalculate error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}