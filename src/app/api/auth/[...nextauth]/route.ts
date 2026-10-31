import { NextResponse } from 'next/server'

function disabledAuthEndpoint() {
  return NextResponse.json({ error: 'Comptes désactivés pour cette version.' }, { status: 404 })
}

export const GET = disabledAuthEndpoint
export const POST = disabledAuthEndpoint
