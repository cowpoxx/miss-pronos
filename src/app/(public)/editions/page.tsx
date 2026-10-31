import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import EditionsClient from './EditionListClient'

export const dynamic = 'force-dynamic'

export default async function EditionsPage() {
  const [editions, session] = await Promise.all([
    prisma.edition.findMany({
      orderBy: { year: 'desc' },
      include: {
        _count: { select: { candidates: true } },
        officialResult: { select: { winnerId: true } },
      },
    }),
    auth(),
  ])

  return <EditionsClient editions={editions} user={session?.user ?? null} />
}
