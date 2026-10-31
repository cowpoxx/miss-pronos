'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginClient() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Connexion refusée')
      setPassword('')
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur de connexion')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-700 dark:bg-gray-800">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary-600">Administration</p>
        <h1 className="mb-3 font-display text-3xl font-bold">Miss France Pronos</h1>
        <p className="mb-6 text-gray-600 dark:text-gray-300">Saisis le mot de passe administrateur.</p>
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm font-medium" htmlFor="admin-password">Mot de passe</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={256}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 dark:border-gray-600 dark:bg-gray-900"
          />
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <button disabled={busy} className="w-full rounded-lg bg-primary-600 px-4 py-3 font-semibold text-white disabled:opacity-50">
            {busy ? 'Connexion…' : 'Entrer dans l’administration'}
          </button>
        </form>
      </section>
    </main>
  )
}
