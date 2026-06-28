'use client'

import { DataTable } from '@/components/data-table'
import { type Procedure } from '../data/schema'
import { type GetProceduresResponse } from '@/lib/types'
import { proceduresColumns } from './procedures-columns'
import { procedureStatuses } from '../data/data'

type ProceduresTableProps = {
  data: Procedure[]
  pagination: GetProceduresResponse['pagination']
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function ProceduresTable({
  data,
  pagination,
  onPageChange,
  onPageSizeChange,
}: ProceduresTableProps) {
  return (
    <DataTable
      columns={proceduresColumns}
      data={data}
      pagination={pagination}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      searchPlaceholder='Search by patient, procedure...'
      searchKey='patientName'
      filters={[
        {
          columnId: 'status',
          title: 'Status',
          options: procedureStatuses,
        },
      ]}
    />
  )
}
