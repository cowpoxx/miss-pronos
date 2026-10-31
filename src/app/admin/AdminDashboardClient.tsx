'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Candidate {
  id: string
  number: number
  name: string
  region: string
}

interface Ballot {
  name: string
  top5: string[]
  points: number | null
  submittedAt: string
}

interface Props {
  editionTitle: string
  candidates: Candidate[]
  ballots: Ballot[]
  officialTop5: string[] | null
}

export default function AdminDashboardClient({ editionTitle, candidates, ballots, officialTop5 }: Props) {
  const router = useRouter()
  const [top5, setTop5] = useState<string[]>(officialTop5 ?? ['', '', '', '', ''])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)
  const candidateById = new Map(candidates.map((candidate) => [candidate.id, candidate]))

  async function saveResults(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (top5.some((id) => !id) || new Set(top5).size !== 5) {
      setError('Sélectionne cinq candidates différentes, dans l’ordre officiel.')
      return
    }
    if (!officialTop5 && !window.confirm('En enregistrant les résultats, tous les pronostics et les scores seront révélés aux votants. Continuer ?')) return

    setBusy(true)
    try {
      const response = await fetch('/api/admin/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ top5 }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Impossible d’enregistrer les résultats')
      setSuccess('Résultats enregistrés ; les points ont été calculés et les pronostics sont révélés.')
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur serveur')
    } finally {
      setBusy(false)
    }
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.refresh()
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">Administration</p>
            <h1 className="font-display text-3xl font-bold">{editionTitle}</h1>
          </div>
          <button onClick={logout} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold dark:border-gray-600">Se déconnecter</button>
        </header>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-2 font-display text-2xl font-bold">Résultats officiels</h2>
          <p className="mb-5 text-sm text-gray-600 dark:text-gray-300">Saisis les cinq candidates dans l’ordre. L’enregistrement calcule les scores et révèle tous les pronostics.</p>
          <form onSubmit={saveResults} className="space-y-3">
            {top5.map((candidateId, position) => (
              <label key={position} className="flex items-center gap-3">
                <span className="w-24 shrink-0 font-semibold">Place {position + 1}</span>
                <select
                  required
                  value={candidateId}
                  onChange={(event) => setTop5((current) => current.map((id, index) => index === position ? event.target.value : id))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 dark:border-gray-600 dark:bg-gray-900"
                >
                  <option value="">Choisir une candidate</option>
                  {candidates.map((candidate) => (
                    <option
                      key={candidate.id}
                      value={candidate.id}
                      disabled={top5.some((id, index) => index !== position && id === candidate.id)}
                    >
                      {candidate.number} — {candidate.name} ({candidate.region})
                    </option>
                  ))}
                </select>
              </label>
            ))}
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            {success && <p role="status" className="text-sm text-green-700">{success}</p>}
            <button disabled={busy} className="rounded-lg bg-primary-600 px-5 py-3 font-semibold text-white disabled:opacity-50">
              {busy ? 'Calcul en cours…' : officialTop5 ? 'Mettre à jour les résultats' : 'Enregistrer et révéler les pronostics'}
            </button>
          </form>
          <div className="mt-5 rounded-lg bg-gray-50 p-4 text-sm dark:bg-gray-900/60">
            <p className="font-semibold">Barème</p>
            <p>10 points par candidate du Top 5 retrouvée, 15 points supplémentaires par place exacte, 30 points de bonus pour le Top 5 parfait.</p>
            <p className="mt-1 text-gray-600 dark:text-gray-400">Maximum : 155 points.</p>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-1 font-display text-2xl font-bold">Pronostics ({ballots.length})</h2>
          <p className="mb-5 text-sm text-gray-600 dark:text-gray-300">Cette liste est réservée à l’administration avant la saisie des résultats.</p>
          {ballots.length === 0 ? <p className="text-gray-500">Aucun pronostic pour le moment.</p> : (
            <ol className="space-y-4">
              {ballots.map((ballot) => (
                <li key={ballot.name} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold">{ballot.name}</h3>
                    <span className="rounded-full bg-gold-100 px-3 py-1 text-sm font-bold text-gray-800 dark:bg-gray-700 dark:text-gold-200">
                      {ballot.points === null ? 'En attente des résultats' : `${ballot.points} points`}
                    </span>
                  </div>
                  <ol className="grid gap-1 sm:grid-cols-2">
                    {ballot.top5.map((id, index) => {
                      const candidate = candidateById.get(id)
                      return <li key={`${ballot.name}-${index}`} className="text-sm text-gray-700 dark:text-gray-300">{index + 1}. {candidate?.name ?? 'Candidate inconnue'}</li>
                    })}
                  </ol>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </main>
  )
}
