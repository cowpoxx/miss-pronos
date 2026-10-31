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
  edition: { id: string; year: number; title: string }
  scoringRules: {
    winner_exact: number
    top5_contains: number
    top5_exact_position: number
    favorite_bonus: number
    perfect_top5_bonus: number
  }
  officialResult: { winnerId: string | null; top5: string[] } | null
}

interface Props {
  group: Group
  candidates: Candidate[]
  officialResult: { winnerId: string | null; top5: string[] } | null
}

const candidateSchema = z.object({
  number: z.number().min(1).max(30),
  name: z.string().min(2).max(100),
  region: z.string().min(2).max(100),
  photoUrl: z.string().url().optional().or(z.literal('')),
})

const scoringSchema = z.object({
  winner_exact: z.number().min(0).max(100),
  top5_contains: z.number().min(0).max(50),
  top5_exact_position: z.number().min(0).max(50),
  favorite_bonus: z.number().min(0).max(20),
  perfect_top5_bonus: z.number().min(0).max(100),
})

const resultSchema = z.object({
  winnerId: z.string().optional(),
  top5: z.array(z.string()).length(5),
})

export default function AdminClient({ group, candidates, officialResult }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'candidates' | 'scoring' | 'results'>('candidates')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const candidateForm = useForm({ resolver: zodResolver(candidateSchema), defaultValues: { number: candidates.length + 1, name: '', region: '', photoUrl: '' } })
  const scoringForm = useForm({ resolver: zodResolver(scoringSchema), defaultValues: group.scoringRules })
  const resultForm = useForm({ resolver: zodResolver(resultSchema), defaultValues: { winnerId: officialResult?.winnerId || '', top5: officialResult?.top5 || ['', '', '', '', ''] } })

  const candidateIds = candidates.map(c => c.id).sort((a, b) => {
    const ca = candidates.find(c => c.id === a)!
    const cb = candidates.find(c => c.id === b)!
    return ca.number - cb.number
  })

  const handleCandidatesSubmit = async (data: any) => {
    setError(null); setIsLoading(true)
    try {
      const res = await fetch(`/api/groups/${group.id}/candidates`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (!res.ok) throw new Error((await res.json()).error || 'Erreur')
      setSuccess('Candidate ajoutée !')
      candidateForm.reset({ number: candidates.length + 2, name: '', region: '', photoUrl: '' })
      router.refresh()
    } catch (e: any) { setError(e.message) } finally { setIsLoading(false) }
  }

  const handleScoringSubmit = async (data: any) => {
    setError(null); setIsLoading(true)
    try {
      const res = await fetch(`/api/groups/${group.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scoringRules: data }) })
      if (!res.ok) throw new Error((await res.json()).error || 'Erreur')
      setSuccess('Barème mis à jour !')
      router.refresh()
    } catch (e: any) { setError(e.message) } finally { setIsLoading(false) }
  }

  const handleResultSubmit = async (data: any) => {
    setError(null); setIsLoading(true)
    try {
      const res = await fetch(`/api/groups/${group.id}/results`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (!res.ok) throw new Error((await res.json()).error || 'Erreur')
      setSuccess('Résultats enregistrés !')
      router.refresh()
    } catch (e: any) { setError(e.message) } finally { setIsLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-gold-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href={`/groupe/${group.id}`} className="inline-flex items-center gap-2 text-primary-600 hover:underline mb-6">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Retour au groupe
        </Link>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {['candidates', 'scoring', 'results'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-4 px-6 font-medium transition ${activeTab === tab ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                {tab === 'candidates' && '👥 Candidates'} {tab === 'scoring' && '📊 Barème'} {tab === 'results' && '🏁 Résultats'}
              </button>
            ))}
          </div>

          <div className="p-6">
            {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}
            {success && <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg text-sm mb-4">{success}</div>}

            {activeTab === 'candidates' && (
              <div>
                <h3 className="font-display text-xl font-bold mb-4">Gérer les candidates</h3>
                <form onSubmit={candidateForm.handleSubmit(handleCandidatesSubmit)} className="space-y-4 mb-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="grid sm:grid-cols-4 gap-4">
                    <div><label className="block text-sm font-medium mb-1">Numéro</label><input {...candidateForm.register('number')} type="number" min="1" max="30" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500" disabled={isLoading} /></div>
                    <div className="sm:col-span-2"><label className="block text-sm font-medium mb-1">Nom</label><input {...candidateForm.register('name')} type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500" disabled={isLoading} /></div>
                    <div><label className="block text-sm font-medium mb-1">Région</label><input {...candidateForm.register('region')} type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500" disabled={isLoading} /></div>
                    <div className="sm:col-span-2"><label className="block text-sm font-medium mb-1">Photo URL (optionnel)</label><input {...candidateForm.register('photoUrl')} type="url" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500" disabled={isLoading} /></div>
                    <div className="sm:col-span-4"><button type="submit" disabled={isLoading} className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg disabled:opacity-50">{isLoading ? 'Ajout...' : 'Ajouter candidate'}</button></div>
                  </div>
                </form>

                <h4 className="font-semibold mb-3">Candidates actuelles ({candidates.length})</h4>
                {candidates.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">Aucune candidate pour l'instant</p>
                ) : (
                  <div className="space-y-2">
                    {candidateIds.map(id => {
                      const c = candidates.find(x => x.id === id)!
                      return (
                        <div key={c.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-sm">{c.number}</span>
                          <img src={c.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=ec4899&color=fff`} alt={c.name} className="w-10 h-10 rounded-full object-cover" />
                          <div className="flex-1"><p className="font-medium">{c.name}</p><p className="text-sm text-gray-500 dark:text-gray-400">{c.region}</p></div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'scoring' && (
              <form onSubmit={scoringForm.handleSubmit(handleScoringSubmit)} className="space-y-4">
                <h3 className="font-display text-xl font-bold mb-4">Configurer le barème</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {Object.entries(group.scoringRules).map(([key, val]) => (
                    <div key={key}><label className="block text-sm font-medium mb-1">{key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase())}</label><input {...scoringForm.register(key as any)} type="number" min="0" max="100" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500" disabled={isLoading} /></div>
                  ))}
                </div>
                <button type="submit" disabled={isLoading} className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg disabled:opacity-50">{isLoading ? 'Enregistrement...' : 'Sauvegarder le barème'}</button>
              </form>
            )}

            {activeTab === 'results' && (
              <form onSubmit={resultForm.handleSubmit(handleResultSubmit)} className="space-y-4">
                <h3 className="font-display text-xl font-bold mb-4">Enregistrer les résultats officiels</h3>
                <div>
                  <label className="block text-sm font-medium mb-1">Gagnante</label>
                  <select {...resultForm.register('winnerId')} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500" disabled={isLoading}>
                    <option value="">Sélectionnez la gagnante</option>
                    {candidates.map(c => <option key={c.id} value={c.id}>{c.number} - {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Top 5 (dans l'ordre)</label>
                  <div className="space-y-2">
                    {[0,1,2,3,4].map(i => (
                      <select key={i} {...resultForm.register(`top5.${i}`)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500" disabled={isLoading}>
                        <option value="">Position {i+1}</option>
                        {candidates.map(c => <option key={c.id} value={c.id}>{c.number} - {c.name}</option>)}
                      </select>
                    ))}
                  </div>
                </div>
                <button type="submit" disabled={isLoading} className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg disabled:opacity-50">{isLoading ? 'Enregistrement...' : 'Enregistrer les résultats'}</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}