import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ballotSchema } from '@/lib/ballot-validation'
import { normalizePlayerName } from '@/lib/ballot'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const json = await request.json()
    const body = ballotSchema.parse(json)
    
    const edition = await prisma.edition.findFirst({
      where: { isActive: true },
      orderBy: { year: 'desc' }
    })
    
    if (!edition) return NextResponse.json({ error: 'Aucune édition active' }, { status: 404 })
    if (new Date() >= edition.startDate) return NextResponse.json({ error: 'Votes clos' }, { status: 403 })

    const normalizedName = normalizePlayerName(body.name)
    
    const ballot = await prisma.ballot.upsert({
      where: {
        editionId_normalizedName: {
          editionId: edition.id,
          normalizedName
        }
      },
      create: {
        editionId: edition.id,
        name: body.name,
        normalizedName,
        top12: body.top12,
        top5: body.top5
      },
      update: {
        name: body.name,
        top12: body.top12,
        top5: body.top5
      }
    })

    return NextResponse.json(ballot)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur lors de l\'enregistrement' }, { status: 400 })
  }
}
