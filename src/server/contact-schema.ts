import * as z from 'zod/mini'

export const contactSchema = z.object({
  name: z.string().check(z.minLength(1), z.maxLength(100)),
  email: z.string().check(z.email(), z.maxLength(254)),
  message: z.string().check(z.minLength(10), z.maxLength(500)),
  locale: z.enum(['en', 'fr']),
  website: z.optional(z.string().check(z.maxLength(200))),
})

export type ContactValues = z.infer<typeof contactSchema>
export type ContactField = 'name' | 'email' | 'message'
export type ContactErrors = Partial<Record<ContactField, 'required' | 'email' | 'short' | 'long'>>

export function validateContact(input: unknown) {
  return contactSchema.safeParse(input)
}

export function contactErrorCodes(input: unknown): ContactErrors {
  const result = validateContact(input)
  if (result.success) return {}

  const errors: ContactErrors = {}
  for (const issue of result.error.issues) {
    const field = issue.path[0]
    if (field !== 'name' && field !== 'email' && field !== 'message' || errors[field]) continue
    if (field === 'email') errors.email = 'email'
    else if (field === 'name') errors.name = 'required'
    else if (field === 'message') {
      const value = typeof input === 'object' && input !== null && 'message' in input
        ? String(input.message ?? '')
        : ''
      errors.message = value.length > 500 ? 'long' : 'short'
    }
  }
  return errors
}
