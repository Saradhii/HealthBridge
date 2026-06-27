import { z } from 'zod'

const prescriptionStatusSchema = z.union([
  z.literal('active'),
  z.literal('completed'),
  z.literal('cancelled'),
])
export type PrescriptionStatus = z.infer<typeof prescriptionStatusSchema>

const prescriptionItemSchema = z.object({
  name: z.string(),
  dosage: z.string(),
  frequency: z.string(),
  duration: z.string(),
  instructions: z.string().optional(),
})
export type PrescriptionItem = z.infer<typeof prescriptionItemSchema>

const patientSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
})

const doctorSchema = z.object({
  id: z.string(),
  name: z.string(),
})

const prescriptionSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  patientId: z.string(),
  doctorId: z.string(),
  diagnosis: z.string().nullable(),
  items: z.array(prescriptionItemSchema),
  notes: z.string().nullable(),
  status: prescriptionStatusSchema,
  issuedDate: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  patient: patientSchema,
  doctor: doctorSchema,
})

export type Prescription = z.infer<typeof prescriptionSchema>

export const prescriptionListSchema = z.array(prescriptionSchema)
