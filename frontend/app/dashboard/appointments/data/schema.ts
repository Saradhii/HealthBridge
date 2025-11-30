import { z } from 'zod'

const appointmentStatusSchema = z.union([
  z.literal('scheduled'),
  z.literal('confirmed'),
  z.literal('completed'),
  z.literal('cancelled'),
  z.literal('no_show'),
])
export type AppointmentStatus = z.infer<typeof appointmentStatusSchema>

const appointmentTypeSchema = z.union([
  z.literal('consultation'),
  z.literal('follow-up'),
  z.literal('emergency'),
  z.literal('checkup'),
  z.literal('vaccination'),
  z.literal('surgery'),
  z.literal('therapy'),
  z.literal('diagnostic'),
])
export type AppointmentType = z.infer<typeof appointmentTypeSchema>

const patientSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().nullable(),
  phone: z.string(),
  dateOfBirth: z.string(),
  gender: z.union([z.literal('male'), z.literal('female'), z.literal('other')]),
  bloodGroup: z.string().nullable().optional(),
  allergies: z.string().nullable().optional(),
  chronicConditions: z.string().nullable().optional(),
})

const appointmentSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  patientId: z.string(),
  appointmentDate: z.coerce.date(),
  status: appointmentStatusSchema,
  type: appointmentTypeSchema,
  notes: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  patient: patientSchema,
})

export type Appointment = z.infer<typeof appointmentSchema>

export const appointmentListSchema = z.array(appointmentSchema)
