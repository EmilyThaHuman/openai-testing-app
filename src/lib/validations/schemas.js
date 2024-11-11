import { z } from 'zod'

export const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string().min(1),
    })
  ),
  model: z.string(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().optional(),
})

export const fileSchema = z.object({
  file: z.instanceof(File),
  purpose: z.enum(['fine-tune', 'assistants']),
}) 