import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminClient from './AdminClient'

async function getGroupData(groupId: string, userId: string) {
  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
    include: {
      group: {
        include: {
          edition: {
            select: {
              id: true,
              year: true,
              title: true,
              officialResult: true,
            },
          },
        },
      },
    },
  })
  if (!membership || (membership.role !== 'admin' && membership.group.createdById !== userId)) {
    return null
  }
  return membership
}

async function getCandidates(editionId: string) {
  return prisma.candidate.findMany({
    where: { editionId },
    orderBy: { number: 'asc' },
  })
}

export default async function AdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect('/connexion')

  const membership = await getGroupData(id, session.user.id)
  if (!membership) redirect(`/groupe/${id}`)

  const candidates = await getCandidates(membership.group.editionId)

  const officialResult = membership.group.edition.officialResult
    ? {
        ...membership.group.edition.officialResult,
        top5: Array.isArray(membership.group.edition.officialResult.top5)
          ? membership.group.edition.officialResult.top5.filter((id): id is string => typeof id === 'string')
          : [],
      }
    : null

  const scoringRules = membership.group.scoringRules as {
    winner_exact: number
    top5_contains: number
    top5_exact_position: number
    favorite_bonus: number
    perfect_top5_bonus: number
  }

  return <AdminClient 
    group={{
      ...membership.group,
      scoringRules,
      officialResult,
    }}
    candidates={candidates}
    officialResult={officialResult}
  />
}