import { prisma } from '@/lib/db'
import VoteFormClient from './VoteFormClient'

export const dynamic = 'force-dynamic'

function stringIds(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

export default async function HomePage() {
  const edition = await prisma.edition.findFirst({
    where: { isActive: true },
    orderBy: { year: 'desc' },
    include: {
      candidates: { orderBy: { number: 'asc' } },
      officialResult: true,
    },
  })

  if (!edition) {
    return <main className="min-h-screen p-8 text-center">Aucune édition active n’est configurée.</main>
  }

  const officialTop5 = edition.officialResult ? stringIds(edition.officialResult.top5) : null
  const revealedBallots = officialTop5
    ? await prisma.ballot.findMany({
        where: { editionId: edition.id },
        orderBy: [{ points: 'desc' }, { name: 'asc' }],
        select: { name: true, top5: true, points: true },
      })
    : []

  return (
    <VoteFormClient
      editionTitle={edition.title}
      candidates={edition.candidates.map(({ id, number, name, region }) => ({ id, number, name, region }))}
      closed={Boolean(edition.officialResult) || new Date() >= edition.startDate}
      officialTop5={officialTop5}
      revealedBallots={revealedBallots.map((ballot) => ({
        name: ballot.name,
        top5: stringIds(ballot.top5),
        points: ballot.points,
      }))}
    />
  )
}
