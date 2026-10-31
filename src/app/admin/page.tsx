import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { ADMIN_SESSION_COOKIE, isValidAdminSessionToken } from '@/lib/admin-auth'
import AdminLoginClient from './AdminLoginClient'
import AdminDashboardClient from './AdminDashboardClient'

export const dynamic = 'force-dynamic'

function stringIds(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

export default async function AdminPage() {
  const cookieStore = await cookies()
  const authorized = isValidAdminSessionToken(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
    process.env.ADMIN_PASSWORD,
  )
  if (!authorized) return <AdminLoginClient />

  const edition = await prisma.edition.findFirst({
    where: { isActive: true },
    orderBy: { year: 'desc' },
    include: {
      candidates: { orderBy: { number: 'asc' } },
      officialResult: true,
      ballots: { orderBy: [{ points: 'desc' }, { name: 'asc' }] },
    },
  })

  if (!edition) {
    return <main className="min-h-screen p-8">Aucune édition active n’est configurée.</main>
  }

  return (
    <AdminDashboardClient
      editionTitle={edition.title}
      candidates={edition.candidates.map(({ id, number, name, region }) => ({ id, number, name, region }))}
      ballots={edition.ballots.map((ballot) => ({
        name: ballot.name,
        top5: stringIds(ballot.top5),
        points: ballot.points,
        submittedAt: ballot.submittedAt.toISOString(),
      }))}
      officialTop5={edition.officialResult ? stringIds(edition.officialResult.top5) : null}
    />
  )
}
