export interface ScoringRules {
  winner_exact: number
  top5_contains: number
  top5_exact_position: number
  favorite_bonus: number
  perfect_top5_bonus: number
}

export interface Candidate {
  id: string
  editionId: string
  number: number
  name: string
  region: string
  photoUrl: string | null
  sortOrder: number
}

export interface Edition {
  id: string
  year: number
  title: string
  startDate: Date
  resultsLockedAt: Date | null
  isActive: boolean
}

export interface Group {
  id: string
  name: string
  code: string
  createdById: string
  editionId: string
  scoringRules: ScoringRules
  revealPredictions: boolean
}

export interface GroupMember {
  groupId: string
  userId: string
  role: 'admin' | 'player'
}

export interface Prediction {
  id: string
  groupId: string
  userId: string
  editionId: string
  winnerId: string | null
  top5: string[]
  favorites: string[]
  submittedAt: Date
  lockedAt: Date | null
}

export interface OfficialResult {
  editionId: string
  winnerId: string | null
  top5: string[]
}

export interface ScoreBreakdown {
  winnerExact: number
  top5Contains: number
  top5ExactPosition: number
  favoriteBonus: number
  perfectTop5Bonus: number
  total: number
}