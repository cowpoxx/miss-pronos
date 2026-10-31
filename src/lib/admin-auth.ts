import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

export const ADMIN_SESSION_COOKIE = 'mfp_admin_session'
export const ADMIN_SESSION_TTL_SECONDS = 12 * 60 * 60

function sign(payload: string, password: string): string {
  return createHmac('sha256', password).update(payload).digest('base64url')
}

export function createAdminSessionToken(password: string, now = Date.now()): string {
  if (!password) throw new Error('ADMIN_PASSWORD is not configured')
  const payload = JSON.stringify({
    expiresAt: now + ADMIN_SESSION_TTL_SECONDS * 1000,
    nonce: randomBytes(24).toString('base64url'),
  })
  const encodedPayload = Buffer.from(payload).toString('base64url')
  return `${encodedPayload}.${sign(encodedPayload, password)}`
}

export function isValidAdminSessionToken(
  token: string | undefined,
  password: string | undefined,
  now = Date.now(),
): boolean {
  if (!token || !password) return false
  const parts = token.split('.')
  if (parts.length !== 2) return false

  const [encodedPayload, providedSignature] = parts
  let payload: { expiresAt?: unknown; nonce?: unknown }
  try {
    payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'))
  } catch {
    return false
  }

  if (typeof payload.expiresAt !== 'number' || payload.expiresAt <= now) return false
  if (typeof payload.nonce !== 'string' || payload.nonce.length < 16) return false

  const expected = Buffer.from(sign(encodedPayload, password))
  const provided = Buffer.from(providedSignature)
  return expected.length === provided.length && timingSafeEqual(expected, provided)
}

export function verifyAdminPassword(submitted: string, configured: string | undefined): boolean {
  if (!configured || configured.length < 16 || !submitted) return false
  const submittedBytes = Buffer.from(submitted)
  const configuredBytes = Buffer.from(configured)
  return submittedBytes.length === configuredBytes.length && timingSafeEqual(submittedBytes, configuredBytes)
}

const ADMIN_LOGIN_LIMIT = 5
const ADMIN_LOGIN_WINDOW_MS = 15 * 60 * 1000
const loginFailures = new Map<string, { count: number; resetAt: number }>()

export function isAdminLoginBlocked(key: string, now = Date.now()): boolean {
  const record = loginFailures.get(key)
  if (!record) return false
  if (now >= record.resetAt) {
    loginFailures.delete(key)
    return false
  }
  return record.count >= ADMIN_LOGIN_LIMIT
}

export function recordAdminLoginFailure(key: string, now = Date.now()): void {
  const record = loginFailures.get(key)
  if (!record || now >= record.resetAt) {
    loginFailures.set(key, { count: 1, resetAt: now + ADMIN_LOGIN_WINDOW_MS })
    return
  }
  record.count += 1
}

export function clearAdminLoginFailures(key: string): void {
  loginFailures.delete(key)
}
