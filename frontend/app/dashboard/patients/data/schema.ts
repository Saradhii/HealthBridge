import { z } from 'zod'

const patientStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
])
export type PatientStatus = z.infer<typeof patientStatusSchema>

const genderSchema = z.union([
  z.literal('male'),
  z.literal('female'),
  z.literal('other'),
])

const bloodGroupSchema = z.union([
  z.literal('A+'),
  z.literal('A-'),
  z.literal('B+'),
  z.literal('B-'),
  z.literal('AB+'),
  z.literal('AB-'),
  z.literal('O+'),
  z.literal('O-'),
  z.null(),
])

const patientSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().nullable(),
  phone: z.string(),
  dateOfBirth: z.coerce.date(),
  gender: genderSchema,
  bloodGroup: bloodGroupSchema,
  address: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  postalCode: z.string().nullable(),
  country: z.string().nullable(),
  emergencyContactName: z.string().nullable(),
  emergencyContactPhone: z.string().nullable(),
  allergies: z.string().nullable(),
  chronicConditions: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  status: patientStatusSchema,
})

export type Patient = z.infer<typeof patientSchema>

export const patientListSchema = z.array(patientSchema)
