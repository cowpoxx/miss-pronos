import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { ADMIN_SESSION_COOKIE, isValidAdminSessionToken } from '@/lib/admin-auth'
import { calculateTop5Score } from '@/lib/ballot'
import { officialTop5Schema } from '@/lib/ballot-validation'

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

    const top5Parsed = officialTop5Schema.safeParse(
      typeof body === 'object' && body !== null && 'top5' in body ? body.top5 : undefined,
    )
    if (!top5Parsed.success) {
      return NextResponse.json({ error: top5Parsed.error.issues[0]?.message ?? 'Top 5 invalide' }, { status: 400 })
    }

    const edition = await prisma.edition.findFirst({
      where: { isActive: true },
      orderBy: { year: 'desc' },
    })
    if (!edition) return NextResponse.json({ error: 'Aucune édition active' }, { status: 404 })
    if (new Date() < edition.startDate) {
      return NextResponse.json({ error: 'Tu pourras saisir les résultats après le début de l’élection.' }, { status: 409 })
    }

    const candidates = await prisma.candidate.findMany({
      where: { editionId: edition.id, id: { in: top5Parsed.data } },
      select: { id: true },
    })
    if (candidates.length !== 5) {
      return NextResponse.json({ error: 'Une candidate sélectionnée est invalide' }, { status: 400 })
    }

    await prisma.$transaction(async (tx) => {
      await tx.officialResult.upsert({
        where: { editionId: edition.id },
        create: {
          editionId: edition.id,
          winnerId: top5Parsed.data[0],
          top5: top5Parsed.data,
          enteredById: null,
        },
        update: {
          winnerId: top5Parsed.data[0],
          top5: top5Parsed.data,
          enteredById: null,
          enteredAt: new Date(),
        },
      })

      const ballots = await tx.ballot.findMany({ where: { editionId: edition.id } })
      for (const ballot of ballots) {
        const score = calculateTop5Score(idsFromJson(ballot.top5), top5Parsed.data)
        const breakdown: Prisma.InputJsonValue = {
          top5Contains: score.top5Contains,
          exactPositions: score.exactPositions,
          perfectTop5Bonus: score.perfectTop5Bonus,
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
