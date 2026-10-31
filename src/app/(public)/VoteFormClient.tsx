'use client'

import { FormEvent, useState } from 'react'

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
}

interface Props {
  editionTitle: string
  candidates: Candidate[]
  closed: boolean
  officialTop5: string[] | null
  revealedBallots: Ballot[]
}

export default function VoteFormClient({ editionTitle, candidates, closed, officialTop5, revealedBallots }: Props) {
  const [name, setName] = useState('')
  const [top5, setTop5] = useState<string[]>(['', '', '', '', ''])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const candidateById = new Map(candidates.map((candidate) => [candidate.id, candidate]))

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (new Set(top5).size !== 5 || top5.some((id) => !id)) {
      setError('Choisis cinq candidates différentes, dans l’ordre de ton pronostic.')
      return
    }

    setBusy(true)
    try {
      const response = await fetch('/api/ballots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, top5 }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Impossible d’enregistrer le pronostic')
      setSuccess('Ton pronostic est enregistré. Tu peux le modifier en renvoyant le formulaire avec le même nom.')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur serveur')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">Pronostics entre amis</p>
          <h1 className="font-display text-4xl font-bold text-primary-700 dark:text-primary-300 sm:text-5xl">{editionTitle}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-gray-600 dark:text-gray-300">Indique ton nom et classe tes cinq candidates favorites. Aucun compte ni adresse e-mail n’est demandé.</p>
        </header>

        {!closed ? (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800 sm:p-8">
            <h2 className="mb-2 font-display text-2xl font-bold">Mon Top 5</h2>
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">Les pronostics restent visibles uniquement par l’administrateur jusqu’à la saisie des résultats. Les votes portant le même nom sont modifiables par ce nom.</p>
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label htmlFor="voter-name" className="mb-1 block text-sm font-semibold">Ton nom</label>
                <input
                  id="voter-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  minLength={2}
                  maxLength={50}
                  autoComplete="name"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 dark:border-gray-600 dark:bg-gray-900"
                  placeholder="Ex. Antoine"
                />
              </div>
              <div className="space-y-3">
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
              </div>
              {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
              {success && <p role="status" className="text-sm text-green-700">{success}</p>}
              <button disabled={busy} className="w-full rounded-lg bg-primary-600 px-5 py-3 font-semibold text-white disabled:opacity-50 sm:w-auto">
                {busy ? 'Enregistrement…' : 'Enregistrer mon pronostic'}
              </button>
            </form>
          </section>
        ) : (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <h2 className="font-display text-2xl font-bold">Les pronostics sont clos</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">{officialTop5 ? 'Les résultats et le classement des votants sont affichés ci-dessous.' : 'Les résultats seront publiés ici lorsque l’administrateur les aura saisis.'}</p>
          </section>
        )}

        {officialTop5 && (
          <section className="rounded-2xl border border-gold-300 bg-white p-6 shadow-lg dark:border-gold-700 dark:bg-gray-800">
            <h2 className="mb-4 font-display text-2xl font-bold">Résultat officiel</h2>
            <ol className="grid gap-2 sm:grid-cols-2">
              {officialTop5.map((id, index) => <li key={`${id}-${index}`} className="rounded-lg bg-gold-50 px-4 py-3 dark:bg-gray-900">{index + 1}. {candidateById.get(id)?.name ?? 'Candidate inconnue'}</li>)}
            </ol>
          </section>
        )}

        {officialTop5 && (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-1 font-display text-2xl font-bold">Classement des votants</h2>
            <p className="mb-5 text-sm text-gray-600 dark:text-gray-300">Tous les pronostics sont maintenant révélés. Barème : 10 points par candidate retrouvée, 15 de plus pour chaque place exacte, 30 de bonus pour le Top 5 parfait.</p>
            {revealedBallots.length === 0 ? <p className="text-gray-500">Aucun pronostic enregistré.</p> : (
              <ol className="space-y-4">
                {revealedBallots.map((ballot, index) => (
                  <li key={`${ballot.name}-${index}`} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <h3 className="font-semibold">{index + 1}. {ballot.name}</h3>
                      <span className="rounded-full bg-primary-100 px-3 py-1 font-bold text-primary-800 dark:bg-primary-900/40 dark:text-primary-200">{ballot.points ?? 0} pts</span>
                    </div>
                    <ol className="grid gap-1 sm:grid-cols-2">
                      {ballot.top5.map((id, position) => <li key={`${ballot.name}-${position}`} className="text-sm text-gray-700 dark:text-gray-300">{position + 1}. {candidateById.get(id)?.name ?? 'Candidate inconnue'}</li>)}
                    </ol>
                  </li>
                ))}
              </ol>
            )}
          </section>
        )}

        <footer className="flex justify-between text-xs text-gray-500">
          <span>Miss France Pronos — jeu entre amis, sans mise financière.</span>
          <a href="/admin" className="hover:underline">Administration</a>
        </footer>
      </div>
    </main>
  )
}
