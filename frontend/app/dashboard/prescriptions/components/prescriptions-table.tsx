'use client'

import { DataTable } from '@/components/data-table'
import { type Prescription } from '../data/schema'
import { type GetPrescriptionsResponse } from '@/lib/types'
import { prescriptionsColumns } from './prescriptions-columns'
import { prescriptionStatuses } from '../data/data'

type PrescriptionsTableProps = {
  data: Prescription[]
  pagination: GetPrescriptionsResponse['pagination']
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function PrescriptionsTable({
  data,
  pagination,
  onPageChange,
  onPageSizeChange,
}: PrescriptionsTableProps) {
  return (
    <DataTable
      columns={prescriptionsColumns}
      data={data}
      pagination={pagination}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      searchPlaceholder='Search by patient, diagnosis...'
      searchKey='patientName'
      filters={[
        {
          columnId: 'status',
          title: 'Status',
          options: prescriptionStatuses,
        },
      ]}
    />
  )
}
