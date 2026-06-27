'use client'

import { DataTable } from '@/components/data-table'
import { doctorSpecializations, doctorDepartments, shifts } from '../data/data'
import { type User } from '../data/schema'
import { type GetUsersResponse } from '@/lib/types'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { doctorsColumns } from './doctors-columns'

type DoctorsTableProps = {
  data: User[]
  pagination: GetUsersResponse['pagination']
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function DoctorsTable({
  data,
  pagination,
  onPageChange,
  onPageSizeChange,
}: DoctorsTableProps) {
  return (
    <DataTable
      columns={doctorsColumns}
      data={data}
      pagination={pagination}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      emptyMessage='No doctors found.'
      searchPlaceholder='Filter doctors by email or name...'
      searchKey='email'
      filters={[
        {
          columnId: 'status',
          title: 'Status',
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
          ],
        },
        {
          columnId: 'specialization',
          title: 'Specialization',
          options: doctorSpecializations.map((spec) => ({
            label: spec,
            value: spec,
          })),
        },
        {
          columnId: 'department',
          title: 'Department',
          options: doctorDepartments.map((dept) => ({
            label: dept,
            value: dept,
          })),
        },
        {
          columnId: 'shift',
          title: 'Shift',
          options: shifts.map((shift) => ({
            label: shift,
            value: shift,
          })),
        },
      ]}
      bulkActions={(table) => <DataTableBulkActions table={table} />}
    />
  )
}
