export const statusColors = new Map([
  [
    'scheduled',
    'text-blue-600 dark:text-blue-400 border-blue-600/20 dark:border-blue-400/20',
  ],
  [
    'confirmed',
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
  [
    'no_show',
    'text-orange-600 dark:text-orange-400 border-orange-600/20 dark:border-orange-400/20',
  ],
])

export const appointmentTypes = [
  { label: 'Consultation', value: 'consultation' },
  { label: 'Follow-up', value: 'follow-up' },
  { label: 'Emergency', value: 'emergency' },
  { label: 'Checkup', value: 'checkup' },
  { label: 'Vaccination', value: 'vaccination' },
  { label: 'Surgery', value: 'surgery' },
  { label: 'Therapy', value: 'therapy' },
  { label: 'Diagnostic', value: 'diagnostic' },
]

export const appointmentStatuses = [
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'No Show', value: 'no_show' },
]
