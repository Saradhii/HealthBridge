'use client'

import { DataTable } from '@/components/data-table'
import { roles } from '../data/data'
import { type User } from '../data/schema'
import { type GetUsersResponse } from '@/lib/types'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { usersColumns } from './users-columns'

type UsersTableProps = {
  data: User[]
  pagination: GetUsersResponse['pagination']
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function UsersTable({
  data,
  pagination,
  onPageChange,
  onPageSizeChange,
}: UsersTableProps) {
  return (
    <DataTable
      columns={usersColumns}
      data={data}
      pagination={pagination}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      searchPlaceholder='Filter users by email...'
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
          columnId: 'roles',
          title: 'Role',
          options: roles.map((role) => ({ ...role })),
        },
      ]}
      bulkActions={(table) => <DataTableBulkActions table={table} />}
    />
  )
}
