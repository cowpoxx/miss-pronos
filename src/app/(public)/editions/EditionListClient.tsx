'use client'

import Link from 'next/link'
import Image from 'next/image'

interface Edition {
  id: string
  year: number
  title: string
  isActive: boolean
  _count: { candidates: number }
  officialResult: { winnerId: string | null } | null
}

export default function EditionsClient({ editions, user }: { editions: Edition[]; user: any }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-gold-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold text-gray-800 dark:text-gray-100">Éditions Miss France</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Retrouvez toutes les candidates et les résultats</p>
        </div>

        <div className="space-y-6">
          {editions.map(edition => (
            <Link key={edition.id} href={`/editions/${edition.year}`} className="block">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-shadow flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-100 to-gold-100 dark:from-primary-900/30 dark:to-gold-900/30 flex items-center justify-center font-bold text-3xl text-primary-700 dark:text-primary-300">
                  {edition.year}
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl font-bold text-gray-800 dark:text-gray-100">{edition.title}</h3>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>👥 {edition._count.candidates} candidates</span>
                    <span>{edition.isActive ? '🟢 Active' : '⚪ Terminée'}</span>
                    {edition.officialResult?.winnerId && <span className="text-purple-600 dark:text-purple-400">🏁 Résultats publiés</span>}
                  </div>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
              </div>
            </Link>
          ))}
        </div>

        {!user && (
          <div className="mt-12 text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
            <p className="text-gray-600 dark:text-gray-300 mb-4">Créez votre groupe pour faire des pronostics sur la prochaine édition !</p>
            <Link href="/inscription" className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition">
              S'inscrire gratuitement
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}