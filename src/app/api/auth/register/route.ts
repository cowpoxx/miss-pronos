import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ error: 'Les comptes ne sont pas utilisés pour les pronostics.' }, { status: 410 })
}
