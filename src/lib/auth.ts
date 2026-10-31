import type { Session } from 'next-auth'

// Les comptes sont désactivés pour le jeu public : les votants sont identifiés par leur nom.
export async function auth(): Promise<Session | null> {
  return null
}
