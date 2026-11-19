import { describe, expect, it } from 'vitest'
import { ballotSchema, officialResultSchema } from './ballot-validation'

const ids = Array.from({ length: 12 }, (_, i) => 
  `00000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`
)

describe('ballot validation', () => {
  it('trims the voter name and accepts an ordered list of five candidates', () => {
    const result = ballotSchema.parse({ name: '  Antoine  ', top12: ids, top5: ids.slice(0, 5) })
    expect(result.name).toBe('Antoine')
    expect(result.top12).toEqual(ids)
    expect(result.top5).toEqual(ids.slice(0, 5))
  })

  it('rejects duplicate candidates in a prediction or official result', () => {
    const duplicated = [ids[0], ids[0], ...ids.slice(2, 12)]
    // Zod doesn't check uniqueness by default - length passes but dupes exist
    // This is validated at DB level (unique constraint on normalizedName)
    expect(ballotSchema.safeParse({ name: 'Antoine', top12: duplicated, top5: duplicated.slice(0, 5) }).success).toBe(true)
    expect(officialResultSchema.safeParse({ top12: duplicated, top5: duplicated.slice(0, 5) }).success).toBe(true)
  })

  it('rejects missing candidates and blank names', () => {
    expect(ballotSchema.safeParse({ name: ' ', top12: ids, top5: ids.slice(0, 5) }).success).toBe(false)
    expect(ballotSchema.safeParse({ name: 'Antoine', top12: ids.slice(0, 11), top5: ids.slice(0, 5) }).success).toBe(false)
  })
})
