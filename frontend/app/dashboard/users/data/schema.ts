import { z } from 'zod'

const userStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
])
export type UserStatus = z.infer<typeof userStatusSchema>

const roleSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
})

const roleWithStringIdSchema = z.union([
  z.string(),
  roleSchema
])

const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  department: z.string().nullable(),
  specialization: z.string().nullable(),
  shift: z.string().nullable(),
  isActive: z.boolean(),
  emailVerified: z.boolean(),
  forcePasswordChange: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  roles: z.array(roleSchema),
  // Derived field for UI
  status: userStatusSchema,
  // Optional fields from API that may not be needed in UI
  tenantId: z.string().optional(),
})
export type User = z.infer<typeof userSchema>

export const userListSchema = z.array(userSchema)
