'use client'

import Link from 'next/link'

interface Score {
  id: string
  userId: string
  totalPoints: number
  breakdown: Record<string, number>
  user: { id: string; displayName: string; avatarUrl: string | null }
}

interface Group {
  id: string
  name: string
  code: string
  edition: { year: number; title: string }
  officialResult: { winnerId: string | null; top5: string[] } | null
}

interface Props {
  group: Group
  scores: Score[]
}

export default function ClassementClient({ group, scores }: Props) {
  const sortedScores = [...scores].sort((a, b) => b.totalPoints - a.totalPoints)

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-gold-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href={`/groupe/${group.id}`} className="inline-flex items-center gap-2 text-primary-600 hover:underline mb-6">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Retour au groupe
        </Link>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-2xl font-bold text-gray-800 dark:text-gray-100">{group.name}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{group.edition.year} — {group.edition.title}</p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-300 rounded-full text-sm font-medium">
                  Code: {group.code.slice(0, 8).toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {group.officialResult?.winnerId && (
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">🏁 Résultats officiels publiés — Classement définitif</p>
            </div>
          )}

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedScores.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">🏆</div>
                <p className="text-gray-500 dark:text-gray-400">Aucun pronostic soumis pour l'instant</p>
              </div>
            ) : (
              sortedScores.map((score, index) => (
                <div key={score.id} className={`p-4 flex items-center gap-4 ${index < 3 ? 'bg-gold-50/50 dark:bg-gold-900/10' : ''} ${index === 0 ? 'border-l-4 border-gold-500' : ''}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${index === 0 ? 'bg-gold-500 text-white' : index === 1 ? 'bg-gray-300 dark:bg-gray-600 text-white' : index === 2 ? 'bg-amber-700 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <img src={score.user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(score.user.displayName)}&background=ec4899&color=fff`} alt={score.user.displayName} className="w-8 h-8 rounded-full" />
                      <span className="font-semibold text-gray-800 dark:text-gray-100 truncate">{score.user.displayName}</span>
                      {index === 0 && <span className="px-2 py-0.5 bg-gold-500 text-white text-xs font-bold rounded">👑</span>}
                    </div>
                    <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span>Total: <span className="font-bold text-primary-600 dark:text-primary-400">{score.totalPoints} pts</span></span>
                      {Object.entries(score.breakdown).map(([k, v]) => v > 0 && <span key={k} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{k}: +{v}</span>)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 text-center border-t border-gray-200 dark:border-gray-700">
            <Link href={`/groupe/${group.id}/pronostics`} className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Faire mes pronostics
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}