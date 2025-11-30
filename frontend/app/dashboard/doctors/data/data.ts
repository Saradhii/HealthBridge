import { Stethoscope } from 'lucide-react'
import { type UserStatus } from './schema'

export const callTypes = new Map<UserStatus, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
])

export const doctorSpecializations = [
  'General Medicine',
  'Cardiology',
  'Pediatrics',
  'Orthopedic Surgery',
  'Neurosurgery',
  'Obstetrics & Gynecology',
  'Psychiatry',
  'Dermatology',
  'Emergency Medicine',
  'Anesthesiology',
  'Radiology',
  'Pathology',
  'Ophthalmology',
  'ENT',
  'Urology',
] as const

export const doctorDepartments = [
  'Internal Medicine',
  'Surgery',
  'Pediatrics',
  'Obstetrics & Gynecology',
  'Psychiatry',
  'Emergency',
  'ICU',
  'OPD',
  'Radiology',
  'Laboratory',
  'Pharmacy',
] as const

export const shifts = [
  'Morning',
  'Afternoon',
  'Night',
] as const

export const doctorRole = {
  label: 'Doctor',
  value: 'doctor',
  icon: Stethoscope,
} as const