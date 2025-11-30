// Re-export commonly used data from other modules
export { roles } from '../../../users/data/data'

// Additional patient-specific data can be added here as needed
export const patientRelations = [
  {
    label: 'Self',
    value: 'self',
  },
  {
    label: 'Parent',
    value: 'parent',
  },
  {
    label: 'Guardian',
    value: 'guardian',
  },
  {
    label: 'Spouse',
    value: 'spouse',
  },
  {
    label: 'Child',
    value: 'child',
  },
  {
    label: 'Sibling',
    value: 'sibling',
  },
  {
    label: 'Other',
    value: 'other',
  },
] as const