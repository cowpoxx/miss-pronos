'use client'

import { FormEvent, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Candidate {
  id: string
  number: number
  name: string
  region: string
}

interface Ballot {
  name: string
  top12: string[]
  top5: string[]
  points: number | null
}

interface Props {
  editionTitle: string
  candidates: Candidate[]
  closed: boolean
  officialTop5: string[] | null
  officialTop12: string[] | null
  revealedBallots: Ballot[]
}

export default function VoteFormClient({ editionTitle, candidates, closed, officialTop5, officialTop12, revealedBallots }: Props) {
  const [name, setName] = useState('')
  const [top12, setTop12] = useState<string[]>(Array(12).fill(''))
  const [top5, setTop5] = useState<string[]>(Array(5).fill(''))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const candidateById = new Map(candidates.map((candidate) => [candidate.id, candidate]))

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (new Set(top12).size !== 12 || top12.some(id => !id)) {
      setError('Sélectionne 12 candidates différentes pour ton Top 12.')
      return
    }

    if (new Set(top5).size !== 5 || top5.some(id => !id)) {
      setError('Classe 5 candidates différentes pour ton classement final.')
      return
    }

    // Validation : le top 5 doit être dans le top 12
    if (top5.some(id => !top12.includes(id))) {
      setError('Les 5 candidates du classement final doivent faire partie de ta sélection des 12.')
      return
    }

    setBusy(true)
    try {
      const response = await fetch('/api/ballots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, top12, top5 }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Impossible d'enregistrer le pronostic')
      setSuccess('Ton pronostic est enregistré ! Princesse !')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur serveur')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen px-4 py-10 bg-background/50">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="text-center space-y-4">
          <div className="inline-block animate-sparkle">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">👑 Élection Miss France</p>
          </div>
          <h1 className="font-display text-5xl font-extrabold princess-gradient bg-clip-text text-transparent sm:text-6xl animate-float">
            {editionTitle}
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground font-medium">
            Bienvenue dans le salon des pronostics. Indique ton nom et sélectionne tes favorites pour la couronne.
          </p>
        </header>

        {!closed ? (
          <form onSubmit={submit} className="space-y-8">
            <Card className="glass border-none overflow-hidden">
              <CardHeader className="bg-primary/5 border-b border-primary/10">
                <CardTitle className="text-primary flex items-center gap-2">
                  <span>👤</span> Identité du Votant
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label htmlFor="voter-name" className="font-bold text-primary-700">Ton Nom</Label>
                  <Input
                    id="voter-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    minLength={2}
                    maxLength={50}
                    className="bg-white/50 border-primary/20 focus:ring-primary"
                    placeholder="Ex. Princesse Antoine"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-8 md:grid-cols-2">
              <Card className="glass border-none">
                <CardHeader className="bg-accent/10 border-b border-accent/20">
                  <CardTitle className="text-accent-foreground flex items-center gap-2">
                    <span>✨</span> Top 12 Demi-Finalistes
                  </CardTitle>
                  <p className="text-xs text-accent-foreground/70">Choisis les 12 miss qui passeront le premier tour (5 pts par miss correcte).</p>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  {top12.map((candidateId, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-8 text-xs font-bold text-accent-foreground/50">#{idx + 1}</span>
                      <select
                        required
                        value={candidateId}
                        onChange={(e) => setTop12(prev => {
                          const next = [...prev];
                          next[idx] = e.target.value;
                          return next;
                        })}
                        className="w-full rounded-md border border-accent/20 bg-white/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        <option value="">Sélectionner une candidate</option>
                        {candidates.map((c) => (
                          <option key={c.id} value={c.id} disabled={top12.includes(c.id) && top12[idx] !== c.id}>
                            {c.number} — {c.name} ({c.region})
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="glass border-none">
                <CardHeader className="bg-primary/10 border-b border-primary/20">
                  <CardTitle className="text-primary flex items-center gap-2">
                    <span>🌸</span> Classement Final (Top 5)
                  </CardTitle>
                  <p className="text-xs text-primary/70">Classe les 5 meilleures parmi tes 12 sélectionnées (Points : 50, 40, 30, 20, 10. Doublés si rang exact).</p>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {top5.map((candidateId, idx) => (
                    <div key={idx} className="space-y-1">
                      <Label className="text-xs font-bold text-primary/60">
                        {idx === 0 ? '👑 Miss France' : idx === 1 ? '🥈 1ère Dauphine' : idx === 2 ? '🥉 2ème Dauphine' : idx === 3 ? '🏵️ 3ème Dauphine' : '🏵️ 4ème Dauphine'}
                      </Label>
                      <select
                        required
                        value={candidateId}
                        onChange={(e) => setTop5(prev => {
                          const next = [...prev];
                          next[idx] = e.target.value;
                          return next;
                        })}
                        className="w-full rounded-md border border-primary/20 bg-white/50 px-3 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Choisir parmi ton Top 12</option>
                        {top12.filter(id => id).map(id => (
                          <option key={id} value={id} disabled={top5.includes(id) && top5[idx] !== id}>
                            {candidateById.get(id)?.name} ({candidateById.get(id)?.region})
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col items-center gap-4 py-6">
              {error && <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-100 text-sm font-medium">{error}</div>}
              {success && <div className="p-4 rounded-lg bg-green-50 text-green-700 border border-green-100 text-sm font-medium">{success}</div>}
              <Button disabled={busy} size="lg" className="princess-gradient hover:opacity-90 text-white px-12 py-6 text-xl font-bold rounded-full shadow-xl transition-all hover:scale-105 active:scale-95">
                {busy ? 'Enchantement en cours...' : '👑 Enregistrer mon Pronostic'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-20 space-y-6 glass rounded-3xl">
            <h2 className="text-3xl font-display font-bold text-primary">Le rideau est tombé !</h2>
            <p className="text-muted-foreground">Les pronostics sont clos. Les résultats seront révélés bientôt.</p>
          </div>
        )}

        {officialTop5 && (
          <div className="space-y-12">
             <Card className="glass border-accent/30 overflow-hidden shadow-2xl">
              <CardHeader className="bg-accent/20 border-b border-accent/30 text-center">
                <CardTitle className="text-3xl font-display font-bold">💎 Résultat Officiel 💎</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="font-bold text-accent-foreground/70 uppercase tracking-widest text-xs">Top 5 Final</h3>
                    <ol className="space-y-3">
                      {officialTop5.map((id, i) => (
                        <li key={i} className="flex items-center gap-4 p-4 rounded-xl bg-accent/5 border border-accent/10">
                          <span className="text-2xl">{i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🏵️'}</span>
                          <span className="font-bold text-lg">{candidateById.get(id)?.name}</span>
                          <span className="ml-auto text-xs font-medium text-accent-foreground/50">{candidateById.get(id)?.region}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-bold text-accent-foreground/70 uppercase tracking-widest text-xs">Semi-Finalistes (12)</h3>
                    <div className="flex flex-wrap gap-2">
                      {officialTop12?.map(id => (
                        <span key={id} className="px-3 py-1 rounded-full bg-white/50 border border-accent/20 text-xs font-medium">
                          {candidateById.get(id)?.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-none shadow-2xl">
              <CardHeader className="bg-primary/5 border-b border-primary/10">
                <CardTitle className="text-2xl font-display font-bold text-primary">🏆 Classement du Concours</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-primary/10">
                  {revealedBallots.map((ballot, idx) => (
                    <div key={idx} className="p-6 flex flex-col md:flex-row md:items-center gap-6 hover:bg-primary/5 transition-colors">
                      <div className="flex items-center gap-4">
                        <span className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${idx === 0 ? 'bg-accent text-white' : idx === 1 ? 'bg-gray-300 text-gray-700' : idx === 2 ? 'bg-amber-300 text-amber-800' : 'bg-primary/10 text-primary'}`}>
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="font-bold text-lg">{ballot.name}</h4>
                          <p className="text-xs text-muted-foreground">Score Total</p>
                        </div>
                      </div>
                      
                      <div className="md:ml-auto text-center">
                         <span className="text-4xl font-black text-primary drop-shadow-sm">{ballot.points ?? 0}</span>
                         <span className="block text-[10px] font-bold uppercase tracking-tighter text-primary/40">Points</span>
                      </div>

                      <div className="flex gap-2">
                         <div className="flex -space-x-2">
                           {ballot.top5.map((id, i) => (
                             <div key={i} title={candidateById.get(id)?.name} className="w-8 h-8 rounded-full border-2 border-white bg-primary/20 flex items-center justify-center text-[8px] font-bold overflow-hidden">
                               {candidateById.get(id)?.name.split(' ')[0][0]}
                             </div>
                           ))}
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <footer className="text-center py-10 space-y-2">
          <p className="text-xs text-primary/40 font-medium tracking-wide">✨ Créé avec amour pour l'élection Miss France ✨</p>
          <a href="/admin" className="text-[10px] font-bold uppercase tracking-widest text-primary/20 hover:text-primary transition-colors">Portail Administrateur</a>
        </footer>
      </div>
    </main>
  )
}
