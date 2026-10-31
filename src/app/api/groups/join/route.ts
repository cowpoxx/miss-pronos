import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { code } = body

    if (!code || code.length !== 8) {
      return NextResponse.json({ error: 'Code invalide' }, { status: 400 })
    }

    const group = await prisma.group.findUnique({
      where: { code: code.toUpperCase() },
      include: { edition: { select: { id: true, year: true, title: true } } },
    })

    if (!group) {
      return NextResponse.json({ error: 'Groupe introuvable' }, { status: 404 })
    }

    // Ajouter l'utilisateur au groupe s'il n'est pas déjà membre
    await prisma.groupMember.upsert({
      where: { groupId_userId: { groupId: group.id, userId: session.user.id } },
      create: { groupId: group.id, userId: session.user.id, role: 'player' },
      update: {},
    })

    return NextResponse.json({ group })
  } catch (error) {
    console.error('Join group error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}