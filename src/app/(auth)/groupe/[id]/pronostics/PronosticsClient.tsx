'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

interface Candidate {
  id: string
  number: number
  name: string
  region: string
  photoUrl: string | null
}

interface Group {
  id: string
  name: string
  edition: { id: string; year: number; title: string; startDate: Date }
}

interface Prediction {
  winnerId: string | null
  top5: string[]
  favorites: string[]
  lockedAt: Date | string | null
}

interface Props {
  group: Group
  candidates: Candidate[]
  existingPrediction: Prediction | null
}

const predictionSchema = z.object({
  winnerId: z.string().min(1, 'Choisissez la gagnante'),
  top5: z.array(z.string()).length(5, 'Le Top 5 doit contenir exactement 5 candidates'),
  favorites: z.array(z.string()).max(3, 'Maximum 3 favorites'),
}).refine(data => new Set(data.top5).size === 5, {
  message: 'Les 5 candidates du Top 5 doivent être différentes',
  path: ['top5'],
})

type PredictionForm = z.infer<typeof predictionSchema>

export default function PronosticsClient({ group, candidates, existingPrediction }: Props) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLocked, setIsLocked] = useState(false)

  const electionDate = new Date(group.edition.startDate)
  const now = new Date()
  const isPast = now > electionDate

  const defaultValues = {
    winnerId: existingPrediction?.winnerId || '',
    top5: existingPrediction?.top5?.length === 5 ? existingPrediction.top5 : ['', '', '', '', ''],
    favorites: existingPrediction?.favorites || [],
  }

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<PredictionForm>({
    resolver: zodResolver(predictionSchema),
    defaultValues,
  })

  const selectedWinner = watch('winnerId')
  const selectedTop5 = watch('top5')
  const selectedFavorites = watch('favorites')

  const handleSubmitForm = async (data: PredictionForm) => {
    setError(null); setSuccess(null); setIsLoading(true)
    try {
      const res = await fetch(`/api/predictions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: group.id, editionId: group.edition.id, ...data }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Erreur')
      setSuccess('Pronostics enregistrés !')
      router.refresh()
    } catch (e: any) { setError(e.message) } finally { setIsLoading(false) }
  }

  const candidateOptions = candidates.map(c => (
    <option key={c.id} value={c.id}>{c.number} — {c.name} ({c.region})</option>
  ))

  const top5Filled = selectedTop5.filter(Boolean).length

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-gold-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link href={`/groupe/${group.id}`} className="inline-flex items-center gap-2 text-primary-600 hover:underline">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Retour
          </Link>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">{group.edition.year} — {group.edition.title}</p>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{group.name}</p>
          </div>
        </div>

        {(isPast || existingPrediction?.lockedAt) && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <p className="text-amber-700 dark:text-amber-300 font-medium">🔒 Pronostics verrouillés — L'élection a eu lieu ou vous avez déjà soumis.</p>
          </div>
        )}

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="font-display text-2xl font-bold text-gray-800 dark:text-gray-100">Mes pronostics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Gagnante, Top 5 ordonné, jusqu'à 3 favorites</p>
          </div>

          <form onSubmit={handleSubmit(handleSubmitForm)} className="p-6 space-y-8">
            {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">{error}</div>}
            {success && <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg text-sm">{success}</div>}

            {/* Gagnante */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">👑 Gagnante</label>
              <select {...register('winnerId')} disabled={isPast || !!existingPrediction?.lockedAt} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option value="">Choisissez la gagnante</option>
                {candidateOptions}
              </select>
              {errors.winnerId && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.winnerId.message}</p>}
            </div>

            {/* Top 5 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">🏆 Top 5 (dans l'ordre exact)</label>
              <div className="space-y-2">
                {[0, 1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-sm">{i + 1}</span>
                    <select {...register(`top5.${i}`)} disabled={isPast || !!existingPrediction?.lockedAt} className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                      <option value="">Position {i + 1}</option>
                      {candidates
                        .filter(c => !selectedTop5.slice(0, i).includes(c.id))
                        .map(c => <option key={c.id} value={c.id}>{c.number} — {c.name} ({c.region})</option>)}
                    </select>
                  </div>
                ))}
              </div>
              {errors.top5 && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.top5.message}</p>}
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{top5Filled}/5 positions remplies</p>
            </div>

            {/* Favorites */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">⭐ Favorites (max 3, optionnel)</label>
              <div className="flex flex-wrap gap-2">
                {candidates.map(c => (
                  <label key={c.id} className="inline-flex items-center gap-2 px-4 py-2 border-2 rounded-xl cursor-pointer transition
                    {selectedFavorites.includes(c.id)
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-700 text-gray-700 dark:text-gray-300'}">
                    <input type="checkbox" {...register('favorites')} value={c.id} className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500" disabled={isPast || !!existingPrediction?.lockedAt || selectedFavorites.length >= 3 && !selectedFavorites.includes(c.id)} />
                    <span className="text-sm">{c.number} {c.name}</span>
                  </label>
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{selectedFavorites.length}/3 favorites sélectionnées</p>
            </div>

            <button type="submit" disabled={isLoading || isPast || !!existingPrediction?.lockedAt} className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-lg">
              {isLoading ? 'Enregistrement...' : existingPrediction?.lockedAt ? 'Pronostics verrouillés' : 'Valider mes pronostics'}
            </button>
          </form>
        </div>

        <div className="mt-6 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 text-sm text-gray-600 dark:text-gray-400">
          <p className="font-medium mb-2">Rappel du barème :</p>
          <ul className="space-y-1">
            <li>• Gagnante exacte : 50 pts</li>
            <li>• Candidate dans le Top 5 : 10 pts</li>
            <li>• Bonne position dans le Top 5 : 15 pts</li>
            <li>• Favorite dans le Top 5 : 5 pts</li>
            <li>• Top 5 parfait (ordre exact) : 30 pts bonus</li>
          </ul>
        </div>
      </div>
    </div>
  )
}