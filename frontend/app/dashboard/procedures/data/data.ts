import {
  CalendarClock,
  CheckCircle2,
  Loader,
  XCircle,
  Scissors,
  Stethoscope,
  Activity,
  Syringe,
  Microscope,
} from 'lucide-react'

export const statusColors = new Map([
  [
    'scheduled',
    'text-blue-600 dark:text-blue-400 border-blue-600/20 dark:border-blue-400/20',
  ],
  [
    'in_progress',
    'text-amber-600 dark:text-amber-400 border-amber-600/20 dark:border-amber-400/20',
  ],
  [
    'completed',
    'text-green-600 dark:text-green-400 border-green-600/20 dark:border-green-400/20',
  ],
  [
    'cancelled',
    'text-red-600 dark:text-red-400 border-red-600/20 dark:border-red-400/20',
  ],
])

export const procedureStatuses = [
  { label: 'Scheduled', value: 'scheduled', icon: CalendarClock },
  { label: 'In Progress', value: 'in_progress', icon: Loader },
  { label: 'Completed', value: 'completed', icon: CheckCircle2 },
  { label: 'Cancelled', value: 'cancelled', icon: XCircle },
]

export const procedureCategories = [
  { label: 'Surgical', value: 'Surgical', icon: Scissors },
  { label: 'Diagnostic', value: 'Diagnostic', icon: Microscope },
  { label: 'Therapeutic', value: 'Therapeutic', icon: Stethoscope },
  { label: 'Minor', value: 'Minor', icon: Syringe },
  { label: 'Imaging', value: 'Imaging', icon: Activity },
]
