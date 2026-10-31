'use client'

import Link from 'next/link'

interface Group {
  id: string
  name: string
  code: string
  edition: { year: number; title: string } | null
  role: string
  _count: { members: number }
}

interface Props {
  groups: Group[]
}

export default function MesGroupesClient({ groups }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-gold-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-800 dark:text-gray-100">Mes groupes</h1>
          <Link
            href="/groupe/nouveau"
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition shadow-lg hover:shadow-xl"
          >
            + Créer un groupe
          </Link>
        </div>

        {groups.length === 0 ? (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-12 border border-gray-200/50 dark:border-gray-700/50 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="font-display text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              Aucun groupe pour l'instant
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
              Créez votre premier groupe pour inviter vos amis et faire des pronostics ensemble !
            </p>
            <Link
              href="/groupe/nouveau"
              className="inline-block px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition shadow-lg hover:shadow-xl"
            >
              Créer mon premier groupe
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map(group => (
              <Link key={group.id} href={`/groupe/${group.id}`} className="block">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-shadow flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-gold-100 dark:from-primary-900/30 dark:to-gold-900/30 flex items-center justify-center font-bold text-2xl text-primary-700 dark:text-primary-300">
                      {group.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold text-gray-800 dark:text-gray-100">{group.name}</h3>
                      <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <span>👥 {group._count.members} membres</span>
                        {group.edition && <span>📅 {group.edition.year} — {group.edition.title}</span>}
                        <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium">
                          {group.role === 'admin' ? 'Admin' : 'Joueur'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}