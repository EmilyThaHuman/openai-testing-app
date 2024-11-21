import { z } from 'zod';

// Example schemas for database validation
export const userSchema = z.object({
  id: z.string().optional(),
  email: z.string().email(),
  name: z.string().min(2).max(50),
  role: z.enum(['user', 'admin', 'moderator']).default('user'),
  created_at: z.date().optional()
});

export const assistantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  model: z.string(),
  user_id: z.string(),
  configuration: z.record(z.unknown()).optional(),
  created_at: z.date().optional()
});

export const chatSchema = z.object({
  id: z.string().optional(),
  user_id: z.string(),
  assistant_id: z.string(),
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string(),
    timestamp: z.date()
  })),
  created_at: z.date().optional()
});