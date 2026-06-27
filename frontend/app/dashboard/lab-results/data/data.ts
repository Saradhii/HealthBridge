import {
  CheckCircle2,
  CircleDashed,
  Loader,
  XCircle,
  FlaskConical,
  Microscope,
  Droplet,
  HeartPulse,
  Activity,
} from 'lucide-react'

export const statusColors = new Map([
  [
    'ordered',
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

export const labResultStatuses = [
  { label: 'Ordered', value: 'ordered', icon: CircleDashed },
  { label: 'In Progress', value: 'in_progress', icon: Loader },
  { label: 'Completed', value: 'completed', icon: CheckCircle2 },
  { label: 'Cancelled', value: 'cancelled', icon: XCircle },
]

export const labResultCategories = [
  { label: 'Hematology', value: 'Hematology', icon: Droplet },
  { label: 'Biochemistry', value: 'Biochemistry', icon: FlaskConical },
  { label: 'Microbiology', value: 'Microbiology', icon: Microscope },
  { label: 'Pathology', value: 'Pathology', icon: Microscope },
  { label: 'Cardiology', value: 'Cardiology', icon: HeartPulse },
  { label: 'Radiology', value: 'Radiology', icon: Activity },
]
