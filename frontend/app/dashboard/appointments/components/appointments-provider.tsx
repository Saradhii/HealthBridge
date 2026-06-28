'use client'

import { createCrudDialogContext } from '@/components/data-table'
import { type Appointment } from '../data/schema'

const { Provider: AppointmentsProvider, useCrudDialog: useAppointments } =
  createCrudDialogContext<Appointment>('Appointments')

export { AppointmentsProvider, useAppointments }
