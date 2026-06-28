'use client'

import { createCrudDialogContext } from '@/components/data-table'
import { type User } from '../data/schema'

const { Provider: DoctorsProvider, useCrudDialog: useDoctors } =
  createCrudDialogContext<User>('Doctors')

export { DoctorsProvider, useDoctors }
