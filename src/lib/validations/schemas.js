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


export const assistantSchema = z.object({
  name: z.string().min(1, "Name is required"),
  model: z.string(),
  instructions: z.string(),
  temperature: z.number().min(0).max(1),
  assistantType: z.enum(["text-return", "code-assistant"]),
  file_ids: z.array(z.string()).optional(),
  fileSearchEnabled: z.boolean().default(false),
  max_tokens: z.number().min(1).max(32000),
  response_format: z.string(),
  functions: z.array(
    z.object({
      name: z.string(),
      description: z.string().optional(),
      parameters: z.record(z.unknown()).optional(),
    })
  ),
  function_call: z.string(),
  stop: z.array(z.string()),
  top_p: z.number().min(0).max(1),
  presence_penalty: z.number().min(-2).max(2),
  tools: z.array(
    z.object({
      type: z.enum(["code_interpreter", "retrieval", "function", "file_search"]),
      function: z.object({
        name: z.string(),
        description: z.string().optional(),
        parameters: z.object({
          type: z.literal("object"),
          properties: z.record(z.object({
            type: z.string(),
            description: z.string().optional(),
            enum: z.array(z.string()).optional(),
            items: z.object({
              type: z.string(),
              properties: z.record(z.unknown()).optional()
            }).optional()
          })),
          required: z.array(z.string()).optional()
        })
      }).optional()
    })
  ).optional(),
});
