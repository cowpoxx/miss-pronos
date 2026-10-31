import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function EditionPage({ params }: { params: Promise<{ year: string }> }) {
  const { year: yearParam } = await params
  const year = Number(yearParam)
  if (!Number.isInteger(year)) notFound()

  const edition = await prisma.edition.findUnique({
    where: { year },
    include: {
      candidates: { orderBy: { number: 'asc' } },
      officialResult: true,
    },
  })
  if (!edition) notFound()

  const officialTop5 = Array.isArray(edition.officialResult?.top5)
    ? edition.officialResult.top5.filter((id): id is string => typeof id === 'string')
    : []
  const candidatesById = new Map(edition.candidates.map(candidate => [candidate.id, candidate]))
  const winner = edition.officialResult?.winnerId
    ? candidatesById.get(edition.officialResult.winnerId)
    : null

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-gold-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <Link href="/editions" className="text-primary-600 hover:underline">← Toutes les éditions</Link>
        <header className="text-center my-8">
          <h1 className="font-display text-4xl font-bold text-gray-800 dark:text-gray-100">{edition.title}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Édition {edition.year}</p>
        </header>

        {edition.officialResult && (
          <section className="mb-8 rounded-2xl border border-purple-200 bg-white/80 p-6 dark:border-purple-800 dark:bg-gray-800/80">
            <h2 className="font-display text-2xl font-bold text-purple-700 dark:text-purple-300">Résultats officiels</h2>
            {winner && <p className="mt-3 text-lg font-semibold">👑 Gagnante : {winner.name} — {winner.region}</p>}
            {officialTop5.length > 0 && (
              <ol className="mt-4 grid gap-2 sm:grid-cols-2">
                {officialTop5.map((id, index) => {
                  const candidate = candidatesById.get(id)
                  return candidate ? <li key={id} className="rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">{index + 1}. {candidate.name} — {candidate.region}</li> : null
                })}
              </ol>
            )}
          </section>
        )}

        <section>
          <h2 className="font-display text-2xl font-bold text-gray-800 dark:text-gray-100">Candidates ({edition.candidates.length})</h2>
          {edition.candidates.length === 0 ? (
            <p className="mt-4 text-gray-600 dark:text-gray-400">Les candidates n’ont pas encore été ajoutées.</p>
          ) : (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {edition.candidates.map(candidate => (
                <li key={candidate.id} className="rounded-xl border border-gray-200 bg-white/80 p-4 dark:border-gray-700 dark:bg-gray-800/80">
                  <p className="text-sm text-primary-600 dark:text-primary-400">Candidate n° {candidate.number}</p>
                  <h3 className="mt-1 font-semibold text-gray-800 dark:text-gray-100">{candidate.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{candidate.region}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}
