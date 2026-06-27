'use client'

import { createCrudDialogContext } from '@/components/data-table'
import { type Prescription } from '../data/schema'

const { Provider: PrescriptionsProvider, useCrudDialog: usePrescriptions } =
  createCrudDialogContext<Prescription>('Prescriptions')

export { PrescriptionsProvider, usePrescriptions }
