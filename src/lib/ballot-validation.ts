import { z } from 'zod'

export const ballotSchema = z.object({
  name: z.string().min(2, 'Le nom est trop court').max(50, 'Le nom est trop long').trim(),
  top12: z.array(z.string().uuid()).length(12, 'Il faut sélectionner exactement 12 candidates'),
  top5: z.array(z.string().uuid()).length(5, 'Il faut classer exactement 5 candidates'),
})

export const officialResultSchema = z.object({
  top12: z.array(z.string().uuid()).length(12, 'Il faut les 12 demi-finalistes'),
  top5: z.array(z.string().uuid()).length(5, 'Il faut le classement des 5 finalistes'),
})
