'use client'

import { createCrudDialogContext } from '@/components/data-table'
import { type Patient } from '../data/schema'

const { Provider: PatientsProvider, useCrudDialog: usePatients } =
  createCrudDialogContext<Patient>('Patients')

export { PatientsProvider, usePatients }
