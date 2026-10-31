import { describe, expect, it } from 'vitest'
import { createAdminSessionToken, isValidAdminSessionToken, verifyAdminPassword, isAdminLoginBlocked, recordAdminLoginFailure, clearAdminLoginFailures } from './admin-auth'

describe('admin session token', () => {
  it('accepts a signed, unexpired token for the configured password', () => {
    const token = createAdminSessionToken('a-strong-admin-password', 1_000)
    expect(isValidAdminSessionToken(token, 'a-strong-admin-password', 1_001)).toBe(true)
  })

  it('rejects a token signed with another password', () => {
    const token = createAdminSessionToken('a-strong-admin-password', 1_000)
    expect(isValidAdminSessionToken(token, 'different-password', 1_001)).toBe(false)
  })

  it('rejects expired and malformed tokens', () => {
    const token = createAdminSessionToken('a-strong-admin-password', 1_000)
    expect(isValidAdminSessionToken(token, 'a-strong-admin-password', 50_000_000)).toBe(false)
    expect(isValidAdminSessionToken('not-a-token', 'a-strong-admin-password', 1_001)).toBe(false)
    expect(isValidAdminSessionToken(token, undefined, 1_001)).toBe(false)
  })

  it('accepts only the configured admin password of at least 16 characters', () => {
    expect(verifyAdminPassword('a-strong-admin-password', 'a-strong-admin-password')).toBe(true)
    expect(verifyAdminPassword('wrong-password', 'a-strong-admin-password')).toBe(false)
    expect(verifyAdminPassword('short', 'short')).toBe(false)
    expect(verifyAdminPassword('anything', undefined)).toBe(false)
  })

  it('blocks repeated failed logins for fifteen minutes and can reset after success', () => {
    for (let attempt = 0; attempt < 5; attempt += 1) recordAdminLoginFailure('client', 1_000 + attempt)
    expect(isAdminLoginBlocked('client', 1_010)).toBe(true)
    expect(isAdminLoginBlocked('client', 901_001)).toBe(false)

    recordAdminLoginFailure('client', 902_000)
    clearAdminLoginFailures('client')
    expect(isAdminLoginBlocked('client', 902_001)).toBe(false)
  })
})
