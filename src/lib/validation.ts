import { z } from 'zod'

export const predictionSchema = z.object({
  groupId: z.string().uuid(),
  editionId: z.string().uuid(),
  winnerId: z.string().uuid().nullable(),
  top5: z.array(z.string().uuid()).min(1).max(5),
  favorites: z.array(z.string().uuid()).max(10),
})

export const groupCreateSchema = z.object({
  name: z.string().min(3).max(50),
  editionId: z.string().uuid(),
  scoringRules: z.object({
    winner_exact: z.number().min(0).max(100),
    top5_contains: z.number().min(0).max(50),
    top5_exact_position: z.number().min(0).max(50),
    favorite_bonus: z.number().min(0).max(20),
    perfect_top5_bonus: z.number().min(0).max(100),
  }),
  revealPredictions: z.boolean().default(false),
})

export const scoringRulesSchema = z.object({
  winner_exact: z.number().min(0).max(100),
  top5_contains: z.number().min(0).max(50),
  top5_exact_position: z.number().min(0).max(50),
  favorite_bonus: z.number().min(0).max(20),
  perfect_top5_bonus: z.number().min(0).max(100),
})

export type PredictionInput = z.infer<typeof predictionSchema>
export type GroupCreateInput = z.infer<typeof groupCreateSchema>
export type ScoringRulesInput = z.infer<typeof scoringRulesSchema>