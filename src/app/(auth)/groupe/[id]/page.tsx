import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import GroupeDashboardClient from './GroupeDashboardClient'

async function getGroupData(groupId: string, userId: string) {
  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
    include: {
      group: {
        include: {
          edition: { select: { id: true, year: true, title: true, startDate: true } },
          _count: { select: { members: true, predictions: true } },
          members: { include: { user: { select: { id: true, name: true, image: true } } } },
        },
      },
    },
  })
  return membership
}

async function getPrediction(groupId: string, userId: string, editionId: string) {
  return prisma.prediction.findUnique({
    where: { groupId_userId_editionId: { groupId, userId, editionId } },
    include: { user: { select: { name: true } } },
  })
}

async function getAllPredictions(groupId: string, editionId: string) {
  return prisma.prediction.findMany({
    where: { groupId, editionId },
    include: { user: { select: { id: true, name: true } } },
  })
}

async function getOfficialResult(editionId: string) {
  return prisma.officialResult.findUnique({ where: { editionId } })
}

async function getCandidates(editionId: string) {
  return prisma.candidate.findMany({
    where: { editionId },
    orderBy: { number: 'asc' },
  })
}

export default async function GroupePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect('/connexion')

  const membership = await getGroupData(id, session.user.id)
  if (!membership) redirect('/mes-groupes')

  const isAdmin = membership.role === 'admin' || membership.group.createdById === session.user.id
  const canSeePredictions = membership.group.revealPredictions || isAdmin

  const [prediction, predictions, officialResult, candidates] = await Promise.all([
    getPrediction(id, session.user.id, membership.group.editionId),
    canSeePredictions ? getAllPredictions(id, membership.group.editionId) : Promise.resolve([]),
    getOfficialResult(membership.group.editionId),
    getCandidates(membership.group.editionId),
  ])

  const scoringRules = membership.group.scoringRules && typeof membership.group.scoringRules === 'object' && !Array.isArray(membership.group.scoringRules)
    ? Object.fromEntries(Object.entries(membership.group.scoringRules).filter((entry): entry is [string, number] => typeof entry[1] === 'number'))
    : {}

  const normalizeIds = (value: unknown): string[] =>
    Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : []

  const normalizedGroup = {
    ...membership.group,
    members: membership.group.members.map(member => ({
      ...member,
      user: {
        id: member.user.id,
        displayName: member.user.name ?? 'Membre',
        avatarUrl: member.user.image,
      },
    })),
  }
  const normalizedPrediction = prediction ? {
    ...prediction,
    user: { displayName: prediction.user.name ?? 'Membre' },
    top5: normalizeIds(prediction.top5),
    favorites: normalizeIds(prediction.favorites),
  } : null
  const normalizedPredictions = predictions.map(item => ({
    ...item,
    user: { id: item.user.id, displayName: item.user.name ?? 'Membre' },
    top5: normalizeIds(item.top5),
    favorites: normalizeIds(item.favorites),
  }))
  const normalizedOfficialResult = officialResult ? {
    ...officialResult,
    top5: normalizeIds(officialResult.top5),
  } : null

  return <GroupeDashboardClient 
    group={{ ...normalizedGroup, scoringRules }}
    prediction={normalizedPrediction}
    predictions={normalizedPredictions}
    officialResult={normalizedOfficialResult}
    candidates={candidates}
    isAdmin={isAdmin}
  />
}