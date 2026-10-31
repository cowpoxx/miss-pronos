'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Group {
  id: string
  name: string
  code: string
  edition: { id: string; year: number; title: string; startDate: Date }
  revealPredictions: boolean
  scoringRules: Record<string, number>
  members: { userId: string; user: { id: string; displayName: string; avatarUrl: string | null }; role: string }[]
  _count: { members: number; predictions: number }
  createdById: string
}

interface Prediction {
  id: string
  winnerId: string | null
  top5: string[]
  favorites: string[]
  lockedAt: Date | string | null
  user: { displayName: string }
}

interface Props {
  group: Group
  prediction: Prediction | null
  predictions: Prediction[]
  officialResult: { winnerId: string | null; top5: string[] } | null
  candidates: { id: string; number: number; name: string; region: string; photoUrl: string | null }[]
  isAdmin: boolean
}

export default function GroupeDashboardClient({ group, prediction, predictions, officialResult, candidates, isAdmin }: Props) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'predictions' | 'classement' | 'admin'>('dashboard')
  const electionDate = new Date(group.edition.startDate)
  const now = new Date()
  const isPast = now > electionDate
  const isLocked = prediction?.lockedAt || isPast

  const myTop5 = prediction?.top5 || []
  const myWinner = prediction?.winnerId
  const myFavorites = prediction?.favorites || []

  const candidateMap = new Map(candidates.map(c => [c.id, c]))

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-gold-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-800 dark:text-gray-100">{group.name}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span>📅 {group.edition.year} — {group.edition.title}</span>
              <span>👥 {group._count.members} membres</span>
              <span>📝 {group._count.predictions} pronostics</span>
              <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                Code: {group.code.slice(0, 8).toUpperCase()}
              </span>
            </div>
          </div>
          {isAdmin && (
            <Link href={`/groupe/${group.id}/admin`} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition">
              ⚙️ Admin
            </Link>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          {['dashboard', 'predictions', 'classement'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-6 py-3 font-medium border-b-2 transition ${activeTab === tab ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
              {tab === 'dashboard' && '🏠 Tableau de bord'} {tab === 'predictions' && '👁️ Pronostics'} {tab === 'classement' && '🏆 Classement'}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Ma prédiction */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                <h2 className="font-display text-xl font-bold mb-4">📋 Mon pronostic</h2>
                {prediction ? (
                  <>
                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                      <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                        <p className="text-sm text-primary-700 dark:text-primary-300">Ma gagnante</p>
                        {myWinner && candidateMap.get(myWinner) ? (
                          <p className="font-bold text-lg">{candidateMap.get(myWinner)!.number} — {candidateMap.get(myWinner)!.name}</p>
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400">Non choisi</p>
                        )}
                      </div>
                      <div className="p-4 bg-gold-50 dark:bg-gold-900/20 rounded-xl">
                        <p className="text-sm text-gold-700 dark:text-gold-300">Mes favorites</p>
                        {myFavorites.length > 0 ? (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {myFavorites.map(id => candidateMap.get(id) && (
                              <span key={id} className="px-2 py-1 bg-gold-200 dark:bg-gold-800 text-gold-800 dark:text-gold-200 rounded text-sm">
                                {candidateMap.get(id)!.number} {candidateMap.get(id)!.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400">Aucune</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Mon Top 5</p>
                      <div className="space-y-1">
                        {myTop5.map((id, i) => candidateMap.get(id) && (
                          <div key={id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-sm">{i + 1}</span>
                            <img src={candidateMap.get(id)!.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(candidateMap.get(id)!.name)}&background=ec4899&color=fff`} alt="" className="w-8 h-8 rounded-full object-cover" />
                            <span className="font-medium">{candidateMap.get(id)!.number} — {candidateMap.get(id)!.name}</span>
                          </div>
                        ))}
                        {myTop5.length < 5 && [...Array(5 - myTop5.length)].map((_, i) => (
                          <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-gray-400">
                            <span className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-sm">{myTop5.length + i + 1}</span>
                            <span>—</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {(isLocked || isPast) && (
                      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-700 dark:text-amber-300 text-sm">
                        🔒 Pronostic verrouillé {isPast ? '— Élection terminée' : ''}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Vous n'avez pas encore fait vos pronostics</p>
                    <Link href={`/groupe/${group.id}/pronostics`} className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition">
                      Faire mes pronostics
                    </Link>
                  </div>
                )}
              </div>

              {/* Résultats officiels */}
              {officialResult?.winnerId && (
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-200 dark:border-purple-800 p-6">
                  <h2 className="font-display text-xl font-bold mb-4 text-purple-700 dark:text-purple-300">🏁 Résultats officiels</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                      <p className="text-sm text-purple-700 dark:text-purple-300">Gagnante</p>
                      {officialResult.winnerId && candidateMap.get(officialResult.winnerId) && (
                        <p className="font-bold text-lg">{candidateMap.get(officialResult.winnerId)!.number} — {candidateMap.get(officialResult.winnerId)!.name}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-purple-700 dark:text-purple-300 mb-2">Top 5 officiel</p>
                      <div className="space-y-1">
                        {officialResult.top5.map((id, i) => candidateMap.get(id) && (
                          <div key={id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <span className="w-8 h-8 rounded-full bg-gold-500 text-white flex items-center justify-center font-bold text-sm">{i + 1}</span>
                            <span className="font-medium">{candidateMap.get(id)!.number} — {candidateMap.get(id)!.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Countdown / Status */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                <h3 className="font-semibold mb-4">⏰ Statut</h3>
                {isPast ? (
                  <div className="text-center">
                    <div className="text-4xl mb-2">🏁</div>
                    <p className="font-bold text-gray-800 dark:text-gray-100">Élection terminée</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Le {electionDate.toLocaleDateString('fr-FR')}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-4xl mb-2">📅</div>
                    <p className="font-bold text-gray-800 dark:text-gray-100">Élection le</p>
                    <p className="text-2xl font-display font-bold text-primary-600 dark:text-primary-400 mt-1">
                      {electionDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                  </div>
                )}
              </div>

              {/* Membres */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                <h3 className="font-semibold mb-4">👥 Membres ({group._count.members})</h3>
                <div className="space-y-2">
                  {group.members.map(m => (
                    <div key={m.userId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <img src={m.user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.user.displayName)}&background=ec4899&color=fff`} alt={m.user.displayName} className="w-8 h-8 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{m.user.displayName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{m.role}</p>
                      </div>
                      {m.user.id === group.createdById && <span className="px-2 py-0.5 bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-300 rounded text-xs font-medium">👑 Créateur</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Barème */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                <h3 className="font-semibold mb-4">📊 Barème</h3>
                <div className="space-y-2 text-sm">
                  {Object.entries(group.scoringRules).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400 capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="font-bold text-primary-600 dark:text-primary-400">{v} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Predictions Tab */}
        {activeTab === 'predictions' && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-display text-xl font-bold">👁️ Pronostics du groupe</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{group.revealPredictions ? 'Visibles pour tous les membres' : 'Cachés jusqu\'au verrouillage (admin peut les révéler)'}</p>
            </div>
            {group.revealPredictions || isAdmin ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {predictions.map(p => (
                  <div key={p.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="flex items-center gap-4 mb-4">
                      <img src={p.user.displayName && `https://ui-avatars.com/api/?name=${encodeURIComponent(p.user.displayName)}&background=ec4899&color=fff`} alt={p.user.displayName} className="w-10 h-10 rounded-full" />
                      <div>
                        <p className="font-bold text-gray-800 dark:text-gray-100">{p.user.displayName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {p.lockedAt ? `Verrouillé le ${new Date(p.lockedAt).toLocaleDateString('fr-FR')}` : 'Non verrouillé'}
                        </p>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4 text-sm">
                      <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                        <p className="text-primary-700 dark:text-primary-300 font-medium">Gagnante</p>
                        {p.winnerId && candidateMap.get(p.winnerId) && <p className="font-semibold">{candidateMap.get(p.winnerId)!.number} — {candidateMap.get(p.winnerId)!.name}</p>}
                      </div>
                      <div className="p-3 bg-gold-50 dark:bg-gold-900/20 rounded-lg">
                        <p className="text-gold-700 dark:text-gold-300 font-medium">Top 5</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {p.top5.map((id, i) => candidateMap.get(id) && (
                            <span key={id} className="px-2 py-0.5 bg-gold-200 dark:bg-gold-800 text-gold-800 dark:text-gold-200 rounded text-xs">{i + 1}. {candidateMap.get(id)!.name}</span>
                          ))}
                        </div>
                      </div>
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-purple-700 dark:text-purple-300 font-medium">Favorites</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {p.favorites.map(id => candidateMap.get(id) && (
                            <span key={id} className="px-2 py-0.5 bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded text-xs">{candidateMap.get(id)!.name}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {predictions.length === 0 && (
                  <div className="p-12 text-center text-gray-500 dark:text-gray-400">Aucun pronostic soumis pour l'instant</div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">🔒</div>
                <p className="text-gray-500 dark:text-gray-400">Les pronostics sont cachés jusqu'au verrouillage</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">L'admin peut les révéler dans les paramètres du groupe</p>
              </div>
            )}
          </div>
        )}

        {/* Classement Tab */}
        {activeTab === 'classement' && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-display text-xl font-bold">🏆 Classement</h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {predictions.length === 0 ? (
                <div className="p-12 text-center text-gray-500 dark:text-gray-400">Aucun pronostic soumis — Pas de classement pour l'instant</div>
              ) : (
                [...predictions].sort((a, b) => {
                  // Simple scoring for display
                  const scoreA = a.top5.length * 10 + (a.winnerId ? 50 : 0) + a.favorites.length * 5
                  const scoreB = b.top5.length * 10 + (b.winnerId ? 50 : 0) + b.favorites.length * 5
                  return scoreB - scoreA
                }).map((p, i) => (
                  <div key={p.id} className={`p-4 flex items-center gap-4 ${i < 3 ? 'bg-gold-50/50 dark:bg-gold-900/10' : ''}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${i === 0 ? 'bg-gold-500 text-white' : i === 1 ? 'bg-gray-300 text-white' : i === 2 ? 'bg-amber-700 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}>
                      #{i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 dark:text-gray-100">{p.user.displayName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Score estimé : ~{(p.top5.length * 10 + (p.winnerId ? 50 : 0) + p.favorites.length * 5)} pts</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 text-center">
              <Link href={`/groupe/${group.id}/classement`} className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition">
                Voir le classement détaillé
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}