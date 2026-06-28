'use client'

import { DataTable } from '@/components/data-table'
import { type LabResult } from '../data/schema'
import { type GetLabResultsResponse } from '@/lib/types'
import { labResultsColumns } from './lab-results-columns'
import { labResultStatuses } from '../data/data'

type LabResultsTableProps = {
  data: LabResult[]
  pagination: GetLabResultsResponse['pagination']
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function LabResultsTable({
  data,
  pagination,
  onPageChange,
  onPageSizeChange,
}: LabResultsTableProps) {
  return (
    <DataTable
      columns={labResultsColumns}
      data={data}
      pagination={pagination}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      searchPlaceholder='Search by patient, test name...'
      searchKey='patientName'
      filters={[
        {
          columnId: 'status',
          title: 'Status',
          options: labResultStatuses,
        },
      ]}
    />
  )
}
