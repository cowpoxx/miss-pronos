import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import PronosticsClient from './PronosticsClient'

async function getGroupData(groupId: string, userId: string) {
  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
    include: {
      group: {
        include: {
          edition: { select: { id: true, year: true, title: true, startDate: true } },
        },
      },
    },
  })
  return membership
}

async function getPrediction(groupId: string, userId: string, editionId: string) {
  return prisma.prediction.findUnique({
    where: { groupId_userId_editionId: { groupId, userId, editionId } },
  })
}

async function getCandidates(editionId: string) {
  return prisma.candidate.findMany({
    where: { editionId },
    orderBy: { number: 'asc' },
  })
}

export default async function PronosticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect('/connexion')

  const membership = await getGroupData(id, session.user.id)
  if (!membership) redirect('/mes-groupes')

  const [prediction, candidates] = await Promise.all([
    getPrediction(id, session.user.id, membership.group.editionId),
    getCandidates(membership.group.editionId),
  ])

  const normalizedPrediction = prediction ? {
    ...prediction,
    top5: Array.isArray(prediction.top5) ? prediction.top5.filter((id): id is string => typeof id === 'string') : [],
    favorites: Array.isArray(prediction.favorites) ? prediction.favorites.filter((id): id is string => typeof id === 'string') : [],
  } : null

  return <PronosticsClient 
    group={membership.group}
    candidates={candidates}
    existingPrediction={normalizedPrediction}
  />
}