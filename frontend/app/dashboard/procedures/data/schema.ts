import { z } from 'zod'

const procedureStatusSchema = z.union([
  z.literal('scheduled'),
  z.literal('in_progress'),
  z.literal('completed'),
  z.literal('cancelled'),
])
export type ProcedureStatus = z.infer<typeof procedureStatusSchema>

const patientSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
})

const performedBySchema = z.object({
  id: z.string(),
  name: z.string(),
})

const procedureSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  patientId: z.string(),
  performedById: z.string(),
  name: z.string(),
  category: z.string().nullable(),
  status: procedureStatusSchema,
  scheduledDate: z.coerce.date(),
  completedDate: z.coerce.date().nullable(),
  outcome: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  patient: patientSchema,
  performedBy: performedBySchema,
})

export type Procedure = z.infer<typeof procedureSchema>

export const procedureListSchema = z.array(procedureSchema)
