import { describe, expect, it } from 'vitest'
import {
  canRevealBallots,
  calculateBallotScore,
  normalizePlayerName,
} from './ballot'

const officialTop12 = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l']
const officialTop5 = ['a', 'b', 'c', 'd', 'e']

describe('ballot scoring', () => {
  it('normalizes names consistently for one ballot per person', () => {
    expect(normalizePlayerName('  Élodie   Martin  ')).toBe('élodie martin')
  })

  it('max score: perfect Top 12 + perfect Top 5 exact positions', () => {
    const score = calculateBallotScore(
      { top12: officialTop12, top5: officialTop5 },
      { top12: officialTop12, top5: officialTop5 }
    )
    expect(score.top12Matches).toBe(60)   // 12 * 5
    expect(score.top5Points).toBe(300)    // (50+40+30+20+10)*2 = 300
    expect(score.total).toBe(360)
  })

  it('partial Top 12 + exact Top 5 positions', () => {
    const score = calculateBallotScore(
      { top12: officialTop12.slice(0, 6), top5: officialTop5 },
      { top12: officialTop12, top5: officialTop5 }
    )
    expect(score.top12Matches).toBe(30)   // 6 * 5
    expect(score.top5Points).toBe(300)
    expect(score.total).toBe(330)
  })

  it('Top 5 found but wrong positions (only middle exact by chance)', () => {
    const score = calculateBallotScore(
      { top12: officialTop12, top5: [...officialTop5].reverse() },
      { top12: officialTop12, top5: officialTop5 }
    )
    // Top 12: 60
    // Top 5 reversed: 'e','d','c','b','a' → 'c' at index 2 matches official index 2 (30*2=60)
    // 10+20+60+40+50 = 180
    expect(score.top12Matches).toBe(60)
    expect(score.top5Points).toBe(180)
    expect(score.total).toBe(240)
  })

  it('no matches at all', () => {
    const score = calculateBallotScore(
      { top12: ['x','y','z','w','v','u','t','s','r','q','p','o'], top5: ['x','y','z','w','v'] },
      { top12: officialTop12, top5: officialTop5 }
    )
    expect(score.top12Matches).toBe(0)
    expect(score.top5Points).toBe(0)
    expect(score.total).toBe(0)
  })

  it('keeps ballots private until results are entered, except for the admin', () => {
    expect(canRevealBallots(false, false)).toBe(false)
    expect(canRevealBallots(true, false)).toBe(true)
    expect(canRevealBallots(false, true)).toBe(true)
  })

  it('handles empty strings in top5 gracefully', () => {
    const score = calculateBallotScore(
      { top12: officialTop12, top5: ['a', '', '', '', ''] },
      { top12: officialTop12, top5: officialTop5 }
    )
    expect(score.top5Points).toBe(100) // only first match exact (50*2)
  })
})
