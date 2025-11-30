import { z } from 'zod'

// Room status schema
const roomStatusSchema = z.union([
  z.literal('vacant'),
  z.literal('occupied'),
  z.literal('maintenance'),
])
export type RoomStatus = z.infer<typeof roomStatusSchema>

// Bed type schema
const bedTypeSchema = z.union([
  z.literal('general'),
  z.literal('icu'),
  z.literal('private'),
  z.literal('semi-private'),
])
export type BedType = z.infer<typeof bedTypeSchema>

// Patient stay schema (for patients currently in rooms)
const patientStaySchema = z.object({
  patientId: z.string(),
  patientName: z.string(),
  checkIn: z.coerce.date(),
  expectedCheckOut: z.coerce.date().nullable(),
})
export type PatientStay = z.infer<typeof patientStaySchema>

// Room schema
const roomSchema = z.object({
  id: z.string(),
  wardId: z.string(),
  roomNumber: z.string(),
  bedType: bedTypeSchema,
  status: roomStatusSchema,
  currentPatient: patientStaySchema.nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type Room = z.infer<typeof roomSchema>

// Ward schema
const wardSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  department: z.string().nullable(),
  floor: z.string().nullable(),
  totalBeds: z.number(),
  occupiedBeds: z.number(),
  rooms: z.array(roomSchema),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type Ward = z.infer<typeof wardSchema>

export const wardListSchema = z.array(wardSchema)
