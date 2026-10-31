import { z } from 'zod'

export const officialTop5Schema = z
  .array(z.string().uuid())
  .length(5, 'Le classement doit contenir exactement cinq candidates')
  .refine((ids) => new Set(ids).size === 5, 'Chaque candidate ne peut apparaître qu’une fois')

export const ballotSubmissionSchema = z.object({
  name: z.string().trim().min(2, 'Le nom doit contenir au moins deux caractères').max(50),
  top5: officialTop5Schema,
}).strict()

export type BallotSubmission = z.infer<typeof ballotSubmissionSchema>
