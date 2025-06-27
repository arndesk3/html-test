import { z } from 'zod'

export const SignupSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  company: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
})

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

export type FormState = { message?: string } | undefined

export interface SessionPayload {
  sessionId: string
  expiresAt: Date
}
