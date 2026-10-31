import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ClassementClient from './ClassementClient'

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
  return membership
}

async function getScores(groupId: string, editionId: string) {
  return prisma.score.findMany({
    where: { groupId, editionId },
    include: { user: { select: { id: true, name: true, image: true } } },
  })
}

export default async function ClassementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect('/connexion')

  const membership = await getGroupData(id, session.user.id)
  if (!membership) redirect('/mes-groupes')

  const scores = await getScores(id, membership.group.editionId)
  const normalizedScores = scores.map(score => ({
    ...score,
    user: {
      id: score.user.id,
      displayName: score.user.name ?? 'Membre',
      avatarUrl: score.user.image,
    },
    breakdown: score.breakdown && typeof score.breakdown === 'object' && !Array.isArray(score.breakdown)
      ? Object.fromEntries(Object.entries(score.breakdown).filter((entry): entry is [string, number] => typeof entry[1] === 'number'))
      : {},
  }))

  const officialResult = membership.group.edition.officialResult
    ? {
        ...membership.group.edition.officialResult,
        top5: Array.isArray(membership.group.edition.officialResult.top5)
          ? membership.group.edition.officialResult.top5.filter((id): id is string => typeof id === 'string')
          : [],
      }
    : null

  return <ClassementClient 
    group={{
      ...membership.group,
      officialResult,
    }}
    scores={normalizedScores}
  />
}