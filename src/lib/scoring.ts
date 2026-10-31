import { ScoringRules } from '@/types'

export interface ScoreBreakdown {
  winnerExact: number
  top5Contains: number
  top5ExactPosition: number
  favoriteBonus: number
  perfectTop5Bonus: number
  total: number
}

export function calculateScore(
  prediction: {
    winnerId: string | null
    top5: string[]
    favorites: string[]
  },
  official: {
    winnerId: string | null
    top5: string[]
  },
  rules: ScoringRules
): ScoreBreakdown {
  let winnerExact = 0
  let top5Contains = 0
  let top5ExactPosition = 0
  let favoriteBonus = 0
  let perfectTop5Bonus = 0

  // Gagnante exacte
  if (prediction.winnerId && prediction.winnerId === official.winnerId) {
    winnerExact = rules.winner_exact
  }

  // Top 5
  const officialTop5 = official.top5
  const predictedTop5 = prediction.top5

  predictedTop5.forEach((candidateId, index) => {
    const officialIndex = officialTop5.indexOf(candidateId)
    if (officialIndex !== -1) {
      top5Contains += rules.top5_contains
      if (officialIndex === index) {
        top5ExactPosition += rules.top5_exact_position
      }
    }
  })

  // Favorites bonus
  if (rules.favorite_bonus > 0) {
    prediction.favorites.forEach((favId) => {
      if (officialTop5.includes(favId) || favId === official.winnerId) {
        favoriteBonus += rules.favorite_bonus
      }
    })
  }

  // Perfect top 5 bonus
  const isPerfectTop5 = predictedTop5.length === 5 &&
    predictedTop5.every((id, i) => id === officialTop5[i])
  if (isPerfectTop5) {
    perfectTop5Bonus = rules.perfect_top5_bonus
  }

  const total = winnerExact + top5Contains + top5ExactPosition + favoriteBonus + perfectTop5Bonus

  return { winnerExact, top5Contains, top5ExactPosition, favoriteBonus, perfectTop5Bonus, total }
}

export function calculateAllScores(
  predictions: Array<{
    id: string
    userId: string
    winnerId: string | null
    top5: string[]
    favorites: string[]
  }>,
  official: { winnerId: string | null; top5: string[] },
  rules: ScoringRules
) {
  return predictions.map((p) => ({
    predictionId: p.id,
    userId: p.userId,
    ...calculateScore(p, official, rules),
  }))
}