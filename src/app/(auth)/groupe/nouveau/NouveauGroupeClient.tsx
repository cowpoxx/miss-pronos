'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

interface Edition {
  id: string
  year: number
  title: string
}

interface Props {
  editions: Edition[]
}

const createGroupSchema = z.object({
  name: z.string().min(2, 'Minimum 2 caractères').max(50, 'Maximum 50 caractères'),
  editionId: z.string().min(1, 'Choisissez une édition'),
  scoringRules: z.object({
    winner_exact: z.number().min(0).max(100).default(50),
    top5_contains: z.number().min(0).max(50).default(10),
    top5_exact_position: z.number().min(0).max(50).default(15),
    favorite_bonus: z.number().min(0).max(20).default(5),
    perfect_top5_bonus: z.number().min(0).max(100).default(30),
  }).default({
    winner_exact: 50,
    top5_contains: 10,
    top5_exact_position: 15,
    favorite_bonus: 5,
    perfect_top5_bonus: 30,
  }),
})

type CreateGroupForm = z.infer<typeof createGroupSchema>

export default function NouveauGroupeClient({ editions }: Props) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm<z.input<typeof createGroupSchema>, unknown, CreateGroupForm>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      scoringRules: {
        winner_exact: 50,
        top5_contains: 10,
        top5_exact_position: 15,
        favorite_bonus: 5,
        perfect_top5_bonus: 30,
      },
    },
  })

  const scoringRules = {
    winner_exact: 50,
    top5_contains: 10,
    top5_exact_position: 15,
    favorite_bonus: 5,
    perfect_top5_bonus: 30,
    ...(watch('scoringRules') || {}),
  }

  const onSubmit = async (data: CreateGroupForm) => {
    setError(null)
    setIsLoading(true)
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Erreur lors de la création')
      router.push(`/groupe/${result.group.id}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const totalPoints = 
    scoringRules.winner_exact +
    scoringRules.top5_contains * 5 +
    scoringRules.top5_exact_position * 5 +
    scoringRules.favorite_bonus * 5 +
    scoringRules.perfect_top5_bonus

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-gold-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/mes-groupes" className="inline-flex items-center gap-2 text-primary-600 hover:underline mb-8">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </Link>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-200/50 dark:border-gray-700/50">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-gray-800 dark:text-gray-100">Créer un groupe</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Invitez vos amis et pariez ensemble sur Miss France</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom du groupe
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                autoComplete="off"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                placeholder="Ex: Famille Dupont, Les Copains 2025..."
                disabled={isLoading}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="editionId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Édition Miss France
              </label>
              <select
                {...register('editionId')}
                id="editionId"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                disabled={isLoading}
              >
                <option value="">Sélectionnez une édition</option>
                {editions.map(edition => (
                  <option key={edition.id} value={edition.id}>
                    {edition.year} — {edition.title}
                  </option>
                ))}
              </select>
              {errors.editionId && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.editionId.message}</p>}
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Barème de points (personnalisable)</h3>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <ScoreInput label="Gagnante exacte" points={scoringRules.winner_exact} onChange={v => setValue('scoringRules', { ...scoringRules, winner_exact: v })} />
                <ScoreInput label="Candidate dans le Top 5" points={scoringRules.top5_contains} onChange={v => setValue('scoringRules', { ...scoringRules, top5_contains: v })} />
                <ScoreInput label="Bonne position dans Top 5" points={scoringRules.top5_exact_position} onChange={v => setValue('scoringRules', { ...scoringRules, top5_exact_position: v })} />
                <ScoreInput label="Favorite dans le Top 5" points={scoringRules.favorite_bonus} onChange={v => setValue('scoringRules', { ...scoringRules, favorite_bonus: v })} />
                <ScoreInput label="Top 5 parfait (bonus)" points={scoringRules.perfect_top5_bonus} onChange={v => setValue('scoringRules', { ...scoringRules, perfect_top5_bonus: v })} />
              </div>
              <div className="text-right text-lg font-bold text-primary-600 dark:text-primary-400">
                Total max : {totalPoints} pts
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              {isLoading ? 'Création...' : 'Créer le groupe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function ScoreInput({ label, points, onChange }: { label: string; points: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input
        type="number"
        min="0"
        max="100"
        value={points}
        onChange={e => onChange(parseInt(e.target.value) || 0)}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-center"
      />
    </div>
  )
}