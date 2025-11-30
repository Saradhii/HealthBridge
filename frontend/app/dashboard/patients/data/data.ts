import { User2, User, Users, Circle, CheckCircle2, XCircle, Droplet } from 'lucide-react'
import { type PatientStatus } from './schema'

// Status colors for badges
export const callTypes = new Map<PatientStatus, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
])

// Gender filter options
export const genders = [
  {
    label: 'Male',
    value: 'male',
    icon: User2,
  },
  {
    label: 'Female',
    value: 'female',
    icon: User,
  },
  {
    label: 'Other',
    value: 'other',
    icon: Users,
  },
] as const

// Blood group filter options
export const bloodGroups = [
  {
    label: 'A+',
    value: 'A+',
    icon: Droplet,
  },
  {
    label: 'A-',
    value: 'A-',
    icon: Droplet,
  },
  {
    label: 'B+',
    value: 'B+',
    icon: Droplet,
  },
  {
    label: 'B-',
    value: 'B-',
    icon: Droplet,
  },
  {
    label: 'AB+',
    value: 'AB+',
    icon: Droplet,
  },
  {
    label: 'AB-',
    value: 'AB-',
    icon: Droplet,
  },
  {
    label: 'O+',
    value: 'O+',
    icon: Droplet,
  },
  {
    label: 'O-',
    value: 'O-',
    icon: Droplet,
  },
] as const

// Status filter options
export const statuses = [
  {
    label: 'Active',
    value: 'active',
    icon: CheckCircle2,
  },
  {
    label: 'Inactive',
    value: 'inactive',
    icon: XCircle,
  },
] as const
