import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { groupCreateSchema } from '@/lib/validation'
import { generateInviteCode } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = groupCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 })
    }

    const { name, editionId, scoringRules, revealPredictions } = parsed.data

    // Vérifier que l'édition existe
    const edition = await prisma.edition.findUnique({ where: { id: editionId } })
    if (!edition) {
      return NextResponse.json({ error: 'Édition introuvable' }, { status: 404 })
    }

    // Créer le groupe
    const code = generateInviteCode()
    const group = await prisma.group.create({
      data: {
        name,
        code,
        editionId,
        createdById: session.user.id,
        scoringRules,
        revealPredictions,
        members: {
          create: { userId: session.user.id, role: 'admin' },
        },
      },
    })

    return NextResponse.json({ group })
  } catch (error) {
    console.error('Create group error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}