import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { canRevealBallots, normalizePlayerName } from '@/lib/ballot'
import { ADMIN_SESSION_COOKIE, isValidAdminSessionToken } from '@/lib/admin-auth'
import { ballotSubmissionSchema } from '@/lib/ballot-validation'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const edition = await prisma.edition.findFirst({
      where: { isActive: true },
      orderBy: { year: 'desc' },
      include: { officialResult: true },
    })
    if (!edition) return NextResponse.json({ error: 'Aucune édition active' }, { status: 404 })

    const isAdmin = isValidAdminSessionToken(
      request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
      process.env.ADMIN_PASSWORD,
    )
    const revealed = canRevealBallots(isAdmin, Boolean(edition.officialResult))
    if (!revealed) return NextResponse.json({ revealed: false, ballots: [] })

    const ballots = await prisma.ballot.findMany({
      where: { editionId: edition.id },
      orderBy: [{ points: 'desc' }, { name: 'asc' }],
      select: { name: true, top5: true, points: true, breakdown: true, submittedAt: true },
    })

    return NextResponse.json({
      revealed: Boolean(edition.officialResult),
      officialTop5: edition.officialResult?.top5 ?? null,
      ballots,
    })
  } catch (error) {
    console.error('Read ballots error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    if (body.length > 4_096) return NextResponse.json({ error: 'Requête trop volumineuse' }, { status: 413 })

    let parsedBody: unknown
    try {
      parsedBody = JSON.parse(body)
    } catch {
      return NextResponse.json({ error: 'Requête JSON invalide' }, { status: 400 })
    }

    const parsed = ballotSubmissionSchema.safeParse(parsedBody)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Pronostic invalide' }, { status: 400 })
    }

    const edition = await prisma.edition.findFirst({
      where: { isActive: true },
      orderBy: { year: 'desc' },
      include: { officialResult: true },
    })
    if (!edition) return NextResponse.json({ error: 'Aucune édition active' }, { status: 404 })
    if (edition.officialResult || new Date() >= edition.startDate) {
      return NextResponse.json({ error: 'Les pronostics sont clos' }, { status: 409 })
    }

    const candidates = await prisma.candidate.findMany({
      where: { editionId: edition.id, id: { in: parsed.data.top5 } },
      select: { id: true },
    })
    if (candidates.length !== 5) {
      return NextResponse.json({ error: 'Une candidate sélectionnée est invalide' }, { status: 400 })
    }

    await prisma.ballot.upsert({
      where: {
        editionId_normalizedName: {
          editionId: edition.id,
          normalizedName: normalizePlayerName(parsed.data.name),
        },
      },
      create: {
        editionId: edition.id,
        name: parsed.data.name,
        normalizedName: normalizePlayerName(parsed.data.name),
        top5: parsed.data.top5,
      },
      update: {
        name: parsed.data.name,
        top5: parsed.data.top5,
        submittedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, message: 'Pronostic enregistré' })
  } catch (error) {
    console.error('Save ballot error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
