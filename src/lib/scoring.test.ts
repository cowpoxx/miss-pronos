import { describe, expect, it } from 'vitest'
import { calculateScore } from './scoring'

const rules = {
  winner_exact: 50,
  top5_contains: 10,
  top5_exact_position: 15,
  favorite_bonus: 5,
  perfect_top5_bonus: 30,
}

const official = {
  winnerId: 'candidate-a',
  top5: ['candidate-a', 'candidate-b', 'candidate-c', 'candidate-d', 'candidate-e'],
}

describe('calculateScore', () => {
  it('awards all points for an exact winner and Top 5', () => {
    const score = calculateScore(
      {
        winnerId: 'candidate-a',
        top5: official.top5,
        favorites: ['candidate-a', 'candidate-b', 'candidate-c'],
      },
      official,
      rules,
    )

    expect(score).toEqual({
      winnerExact: 50,
      top5Contains: 50,
      top5ExactPosition: 75,
      favoriteBonus: 15,
      perfectTop5Bonus: 30,
      total: 220,
    })
  })

  it('awards no points when none of the predictions match', () => {
    const score = calculateScore(
      {
        winnerId: 'candidate-f',
        top5: ['candidate-f', 'candidate-g', 'candidate-h', 'candidate-i', 'candidate-j'],
        favorites: ['candidate-f'],
      },
      official,
      rules,
    )

    expect(score.total).toBe(0)
  })
})
