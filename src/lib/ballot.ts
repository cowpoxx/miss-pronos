export interface Top5Score {
  top5Contains: number
  exactPositions: number
  perfectTop5Bonus: number
  total: number
}

export function normalizePlayerName(name: string): string {
  return name.trim().normalize('NFKC').replace(/\s+/g, ' ').toLocaleLowerCase('fr-FR')
}

export function canRevealBallots(isAdmin: boolean, resultsEntered: boolean): boolean {
  return isAdmin || resultsEntered
}

export function calculateTop5Score(
  prediction: readonly string[],
  official: readonly string[],
): Top5Score {
  if (
    prediction.length !== 5 ||
    official.length !== 5 ||
    new Set(prediction).size !== 5 ||
    new Set(official).size !== 5
  ) {
    return { top5Contains: 0, exactPositions: 0, perfectTop5Bonus: 0, total: 0 }
  }

  const matches = prediction.filter((candidateId) => official.includes(candidateId)).length
  const exactPositions = prediction.reduce(
    (points, candidateId, index) => points + (official[index] === candidateId ? 15 : 0),
    0,
  )
  const perfectTop5Bonus = prediction.every((candidateId, index) => official[index] === candidateId)
    ? 30
    : 0
  const top5Contains = matches * 10

  return {
    top5Contains,
    exactPositions,
    perfectTop5Bonus,
    total: top5Contains + exactPositions + perfectTop5Bonus,
  }
}
