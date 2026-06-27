import { z } from 'zod'

const labResultStatusSchema = z.union([
  z.literal('ordered'),
  z.literal('in_progress'),
  z.literal('completed'),
  z.literal('cancelled'),
])
export type LabResultStatus = z.infer<typeof labResultStatusSchema>

const patientSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
})

const orderedBySchema = z.object({
  id: z.string(),
  name: z.string(),
})

const labResultSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  patientId: z.string(),
  orderedById: z.string(),
  testName: z.string(),
  category: z.string().nullable(),
  status: labResultStatusSchema,
  resultValue: z.string().nullable(),
  unit: z.string().nullable(),
  referenceRange: z.string().nullable(),
  notes: z.string().nullable(),
  orderedDate: z.coerce.date(),
  resultDate: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  patient: patientSchema,
  orderedBy: orderedBySchema,
})

export type LabResult = z.infer<typeof labResultSchema>

export const labResultListSchema = z.array(labResultSchema)
