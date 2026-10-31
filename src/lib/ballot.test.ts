import { describe, expect, it } from 'vitest'
import {
  canRevealBallots,
  calculateTop5Score,
  normalizePlayerName,
} from './ballot'

const official = ['a', 'b', 'c', 'd', 'e']

describe('name-only ballot rules', () => {
  it('normalizes names consistently for one ballot per person', () => {
    expect(normalizePlayerName('  Élodie   Martin  ')).toBe('élodie martin')
  })

  it('scores an exact ordered Top 5', () => {
    expect(calculateTop5Score(official, official).total).toBe(155)
  })

  it('awards only found-candidate points when the order is reversed', () => {
    expect(calculateTop5Score([...official].reverse(), official).total).toBe(65)
  })

  it('keeps ballots private until results are entered, except for the admin', () => {
    expect(canRevealBallots(false, false)).toBe(false)
    expect(canRevealBallots(true, false)).toBe(true)
    expect(canRevealBallots(false, true)).toBe(true)
  })
})
