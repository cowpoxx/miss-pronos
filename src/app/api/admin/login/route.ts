import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  clearAdminLoginFailures,
  createAdminSessionToken,
  isAdminLoginBlocked,
  recordAdminLoginFailure,
  verifyAdminPassword,
} from '@/lib/admin-auth'

export const runtime = 'nodejs'

const loginSchema = z.object({ password: z.string().min(1).max(256) }).strict()

function clientKey(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  return forwardedFor?.split(',').at(-1)?.trim() || 'unknown'
}

export async function POST(request: NextRequest) {
  const key = clientKey(request)
  if (isAdminLoginBlocked(key)) {
    return NextResponse.json({ error: 'Trop de tentatives. Réessaie dans quinze minutes.' }, { status: 429 })
  }

  const configuredPassword = process.env.ADMIN_PASSWORD
  if (!configuredPassword || configuredPassword.length < 16) {
    return NextResponse.json({ error: 'Le mot de passe administrateur doit être configuré (16 caractères minimum).' }, { status: 503 })
  }

  let body: unknown
  try {
    const raw = await request.text()
    if (raw.length > 1_024) return NextResponse.json({ error: 'Requête trop volumineuse' }, { status: 413 })
    body = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success || !verifyAdminPassword(parsed.data.password, configuredPassword)) {
    recordAdminLoginFailure(key)
    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
  }

  clearAdminLoginFailures(key)
  const response = NextResponse.json({ success: true })
  response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(configuredPassword), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  })
  return response
}
