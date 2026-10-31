import { describe, expect, it } from 'vitest'
import { ballotSubmissionSchema, officialTop5Schema } from './ballot-validation'

const ids = [
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000002',
  '00000000-0000-4000-8000-000000000003',
  '00000000-0000-4000-8000-000000000004',
  '00000000-0000-4000-8000-000000000005',
]

describe('ballot validation', () => {
  it('trims the voter name and accepts an ordered list of five candidates', () => {
    expect(ballotSubmissionSchema.parse({ name: '  Antoine  ', top5: ids })).toEqual({
      name: 'Antoine',
      top5: ids,
    })
  })

  it('rejects duplicate candidates in a prediction or official result', () => {
    const duplicated = [ids[0], ids[0], ...ids.slice(2)]
    expect(ballotSubmissionSchema.safeParse({ name: 'Antoine', top5: duplicated }).success).toBe(false)
    expect(officialTop5Schema.safeParse(duplicated).success).toBe(false)
  })

  it('rejects missing candidates and blank names', () => {
    expect(ballotSubmissionSchema.safeParse({ name: ' ', top5: ids }).success).toBe(false)
    expect(ballotSubmissionSchema.safeParse({ name: 'Antoine', top5: ids.slice(0, 4) }).success).toBe(false)
  })
})
