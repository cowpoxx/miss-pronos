import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import MesGroupesClient from './MesGroupesClient'

async function getUserGroups(userId: string) {
  return prisma.groupMember.findMany({
    where: { userId },
    include: {
      group: {
        include: {
          edition: { select: { year: true, title: true } },
          _count: { select: { members: true } },
        },
      },
    },
    orderBy: { joinedAt: 'desc' },
  })
}

export default async function MesGroupesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/connexion')

  const memberships = await getUserGroups(session.user.id)
  const groups = memberships.map(m => ({
    id: m.group.id,
    name: m.group.name,
    code: m.group.code,
    edition: m.group.edition,
    role: m.role,
    _count: { members: m.group._count.members },
  }))

  return <MesGroupesClient groups={groups} />
}