import { CheckCircle2, CircleDot, XCircle } from 'lucide-react'

export const statusColors = new Map([
  [
    'active',
    'text-green-600 dark:text-green-400 border-green-600/20 dark:border-green-400/20',
  ],
  [
    'completed',
    'text-gray-600 dark:text-gray-400 border-gray-600/20 dark:border-gray-400/20',
  ],
  [
    'cancelled',
    'text-red-600 dark:text-red-400 border-red-600/20 dark:border-red-400/20',
  ],
])

export const prescriptionStatuses = [
  { label: 'Active', value: 'active', icon: CircleDot },
  { label: 'Completed', value: 'completed', icon: CheckCircle2 },
  { label: 'Cancelled', value: 'cancelled', icon: XCircle },
]
