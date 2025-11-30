import { Shield, UserCheck, Users, Stethoscope, Pill } from 'lucide-react'
import { type UserStatus } from './schema'

export const callTypes = new Map<UserStatus, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
])

export const roles = [
  {
    label: 'Hospital Admin',
    value: 'hospital_admin',
    icon: Shield,
  },
  {
    label: 'Doctor',
    value: 'doctor',
    icon: Stethoscope,
  },
  {
    label: 'Nurse',
    value: 'nurse',
    icon: UserCheck,
  },
  {
    label: 'Pharmacist',
    value: 'pharmacist',
    icon: Pill,
  },
  {
    label: 'Receptionist',
    value: 'receptionist',
    icon: Users,
  },
] as const
