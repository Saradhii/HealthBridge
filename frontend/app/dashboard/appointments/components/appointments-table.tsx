'use client'

import { DataTable } from '@/components/data-table'
import { type Appointment } from '../data/schema'
import { type GetAppointmentsResponse } from '@/lib/types'
import { appointmentsColumns } from './appointments-columns'
import { appointmentStatuses, appointmentTypes } from '../data/data'

type AppointmentsTableProps = {
  data: Appointment[]
  pagination: GetAppointmentsResponse['pagination']
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function AppointmentsTable({
  data,
  pagination,
  onPageChange,
  onPageSizeChange,
}: AppointmentsTableProps) {
  return (
    <DataTable
      columns={appointmentsColumns}
      data={data}
      pagination={pagination}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      searchPlaceholder='Search by patient name, phone...'
      searchKey='patientName'
      filters={[
        {
          columnId: 'status',
          title: 'Status',
          options: appointmentStatuses,
        },
        {
          columnId: 'type',
          title: 'Type',
          options: appointmentTypes,
        },
      ]}
    />
  )
}
