'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  type SortingState,
  type VisibilityState,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTableServerPagination, DataTableToolbar } from '@/components/data-table'
import { type Patient } from '../data/schema'
import { type GetPatientsResponse } from '@/lib/types'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { patientsColumns as columns } from './patients-columns'
import { UsersTableSkeleton } from './users-table-skeleton'
import { genders, bloodGroups, statuses } from '../data/data'

interface PatientsFilters {
  search: string;
  gender: string;
  bloodGroup: string;
  isActive: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

type DataTableProps = {
  data: Patient[]
  pagination: GetPatientsResponse['pagination']
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  isLoading?: boolean
  filters: PatientsFilters
  updateFilters: (filters: Partial<PatientsFilters>) => void
  resetFilters: () => void
}

export function PatientsTable({
  data,
  pagination,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  isLoading = false,
  filters,
  updateFilters,
  resetFilters,
}: DataTableProps) {
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  // Column filters state for the table (used by DataTableToolbar)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  // Local search state for debouncing
  const [searchValue, setSearchValue] = useState(filters.search)

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchValue !== filters.search) {
        updateFilters({ search: searchValue })
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchValue, filters.search, updateFilters])

  // Sync search value when filters change externally
  useEffect(() => {
    setSearchValue(filters.search)
  }, [filters.search])

  // Sync column filters with server-side filters
  useEffect(() => {
    const newColumnFilters: ColumnFiltersState = []

    if (filters.gender) {
      newColumnFilters.push({ id: 'gender', value: [filters.gender] })
    }
    if (filters.bloodGroup) {
      newColumnFilters.push({ id: 'bloodGroup', value: [filters.bloodGroup] })
    }
    if (filters.isActive) {
      newColumnFilters.push({ id: 'status', value: [filters.isActive === 'true' ? 'active' : 'inactive'] })
    }

    setColumnFilters(newColumnFilters)
  }, [filters.gender, filters.bloodGroup, filters.isActive])

  // Handle column filter changes from DataTableToolbar
  const handleColumnFiltersChange = useCallback((updater: any) => {
    const newFilters = typeof updater === 'function' ? updater(columnFilters) : updater
    setColumnFilters(newFilters)

    // Extract filter values and update server-side filters
    const filterUpdates: any = {}

    // Reset all filters first
    filterUpdates.gender = ''
    filterUpdates.bloodGroup = ''
    filterUpdates.isActive = ''

    newFilters.forEach((filter: any) => {
      if (filter.id === 'gender' && filter.value?.[0]) {
        filterUpdates.gender = filter.value[0]
      } else if (filter.id === 'bloodGroup' && filter.value?.[0]) {
        filterUpdates.bloodGroup = filter.value[0]
      } else if (filter.id === 'status' && filter.value?.[0]) {
        filterUpdates.isActive = filter.value[0] === 'active' ? 'true' : 'false'
      }
    })

    updateFilters(filterUpdates)
  }, [columnFilters, updateFilters])

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      columnVisibility,
      columnFilters,
      sorting: [{ id: filters.sortBy, desc: filters.sortOrder === 'desc' }],
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: handleColumnFiltersChange,
    onSortingChange: (updater) => {
      // Handle sorting changes from user interaction
      const newSorting = typeof updater === 'function'
        ? updater([{ id: filters.sortBy, desc: filters.sortOrder === 'desc' }])
        : updater

      if (newSorting[0]) {
        onSortChange(newSorting[0].id, newSorting[0].desc ? 'desc' : 'asc')
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    // Manual pagination and filtering - server-side
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: pagination.totalPages,
    rowCount: pagination.total,
  })

  if (isLoading) {
    return <UsersTableSkeleton />
  }

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16', // Add margin bottom to the table on mobile when the toolbar is visible
        'flex flex-1 flex-col gap-4'
      )}
    >
      <DataTableToolbar
        table={table}
        searchPlaceholder='Search patients by name, email, phone...'
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        filters={[
          {
            columnId: 'gender',
            title: 'Gender',
            options: genders.map((g) => ({ ...g })),
          },
          {
            columnId: 'bloodGroup',
            title: 'Blood Group',
            options: bloodGroups.map((bg) => ({ ...bg })),
          },
          {
            columnId: 'status',
            title: 'Status',
            options: statuses.map((s) => ({ ...s })),
          },
        ]}
      />

      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        header.column.columnDef.meta?.className,
                        header.column.columnDef.meta?.thClassName
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='group/row'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        cell.column.columnDef.meta?.className,
                        cell.column.columnDef.meta?.tdClassName
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No patients found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTableServerPagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        pageSize={pagination.limit}
        total={pagination.total}
        canPreviousPage={pagination.page > 1}
        canNextPage={pagination.hasMore}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        className='mt-auto'
      />
      <DataTableBulkActions table={table} />
    </div>
  )
}
