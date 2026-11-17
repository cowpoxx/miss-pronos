export interface BallotScore {
  top12Matches: number
  top5Points: number
  total: number
}

export function normalizePlayerName(name: string): string {
  return name.trim().normalize('NFKC').replace(/\s+/g, ' ').toLocaleLowerCase('fr-FR')
}

export function canRevealBallots(isAdmin: boolean, resultsEntered: boolean): boolean {
  return isAdmin || resultsEntered
}

/**
 * Barème :
 * - 12 candidates : 5 pts par candidate correcte dans la liste des 12.
 * - Top 5 : 50, 40, 30, 20, 10 pts selon le rang (1er au 5ème).
 * - Bonus Position Exacte : Les points du Top 5 sont doublés si la miss est au bon rang.
 */
export function calculateBallotScore(
  prediction: { top12: string[], top5: string[] },
  official: { top12: string[], top5: string[] }
): BallotScore {
  // 1. Points pour les 12 (5 pts par miss trouvée)
  const top12MatchesCount = prediction.top12.filter(id => official.top12.includes(id)).length
  const top12Points = top12MatchesCount * 5

  // 2. Points pour le Top 5
  // Rang 0 (1ère) = 50, Rang 1 (2ème) = 40, etc.
  const rankPoints = [50, 40, 30, 20, 10]
  let top5Points = 0

  prediction.top5.forEach((pId, pIdx) => {
    if (!pId) return
    const officialIdx = official.top5.indexOf(pId)
    
    if (officialIdx !== -1) {
      // Elle est dans le Top 5 officiel
      const basePoints = rankPoints[officialIdx]
      const isExact = pIdx === officialIdx
      
      top5Points += isExact ? basePoints * 2 : basePoints
    }
  })

  return {
    top12Matches: top12Points,
    top5Points,
    total: top12Points + top5Points
  }
}
