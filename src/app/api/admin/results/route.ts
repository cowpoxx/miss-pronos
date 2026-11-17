import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { ADMIN_SESSION_COOKIE, isValidAdminSessionToken } from '@/lib/admin-auth'
import { calculateBallotScore } from '@/lib/ballot'
import { officialResultSchema } from '@/lib/ballot-validation'

export const runtime = 'nodejs'

function idsFromJson(value: Prisma.JsonValue): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

export async function POST(request: NextRequest) {
  const isAdmin = isValidAdminSessionToken(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
    process.env.ADMIN_PASSWORD,
  )
  if (!isAdmin) return NextResponse.json({ error: 'Accès refusé' }, { status: 401 })

  try {
    const raw = await request.text()
    if (raw.length > 4_096) return NextResponse.json({ error: 'Requête trop volumineuse' }, { status: 413 })

    let body: unknown
    try {
      body = JSON.parse(raw)
    } catch {
      return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
    }

    const parsed = officialResultSchema.safeParse(
      typeof body === 'object' && body !== null ? body : undefined,
    )
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Résultats invalides' }, { status: 400 })
    }

    const edition = await prisma.edition.findFirst({
      where: { isActive: true },
      orderBy: { year: 'desc' },
    })
    if (!edition) return NextResponse.json({ error: 'Aucune édition active' }, { status: 404 })
    if (new Date() < edition.startDate) {
      return NextResponse.json({ error: 'Tu pourras saisir les résultats après le début de l'élection.' }, { status: 409 })
    }

    const candidates = await prisma.candidate.findMany({
      where: { editionId: edition.id, id: { in: [...parsed.data.top12, ...parsed.data.top5] } },
      select: { id: true },
    })
    if (candidates.length !== 12) {
      return NextResponse.json({ error: 'Une candidate sélectionnée est invalide' }, { status: 400 })
    }

    await prisma.$transaction(async (tx) => {
      await tx.officialResult.upsert({
        where: { editionId: edition.id },
        create: {
          editionId: edition.id,
          winnerId: parsed.data.top5[0],
          top12: parsed.data.top12,
          top5: parsed.data.top5,
          enteredById: null,
        },
        update: {
          winnerId: parsed.data.top5[0],
          top12: parsed.data.top12,
          top5: parsed.data.top5,
          enteredById: null,
          enteredAt: new Date(),
        },
      })

      const ballots = await tx.ballot.findMany({ where: { editionId: edition.id } })
      for (const ballot of ballots) {
        const predictionTop12 = idsFromJson(ballot.top12)
        const predictionTop5 = idsFromJson(ballot.top5)
        const score = calculateBallotScore(
          { top12: predictionTop12, top5: predictionTop5 },
          { top12: parsed.data.top12, top5: parsed.data.top5 }
        )
        const breakdown: Prisma.InputJsonValue = {
          top12Matches: score.top12Matches,
          top5Points: score.top5Points,
          total: score.total,
        }
        await tx.ballot.update({ where: { id: ballot.id }, data: { points: score.total, breakdown } })
      }
    })

    return NextResponse.json({ success: true, message: 'Résultats enregistrés et points calculés' })
  } catch (error) {
    console.error('Save official result error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
