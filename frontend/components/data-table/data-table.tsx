'use client'

import { type ReactNode, useState } from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type OnChangeFn,
  type RowData,
  type SortingState,
  type Table as TanstackTable,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
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
import { DataTableServerPagination } from './server-pagination'
import { DataTableToolbar } from './toolbar'

// Shared column meta augmentation used by every data table for cell/header styling.
declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string
    thClassName?: string
    tdClassName?: string
  }
}

type ServerPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

export type DataTableFilter = {
  columnId: string
  title: string
  options: {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
}

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pagination: ServerPagination
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  // Toolbar
  searchPlaceholder?: string
  searchKey?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  filters?: DataTableFilter[]
  emptyMessage?: string
  // Controlled (server-side) state. When omitted the table manages these itself.
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  columnFilters?: ColumnFiltersState
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>
  manualSorting?: boolean
  manualFiltering?: boolean
  // Optional bulk-actions toolbar rendered below the table.
  bulkActions?: (table: TanstackTable<TData>) => ReactNode
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination,
  onPageChange,
  onPageSizeChange,
  searchPlaceholder,
  searchKey,
  searchValue,
  onSearchChange,
  filters,
  emptyMessage = 'No results.',
  sorting,
  onSortingChange,
  columnFilters,
  onColumnFiltersChange,
  manualSorting = false,
  manualFiltering = false,
  bulkActions,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [internalSorting, setInternalSorting] = useState<SortingState>([])
  const [internalColumnFilters, setInternalColumnFilters] =
    useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      columnVisibility,
      sorting: sorting ?? internalSorting,
      columnFilters: columnFilters ?? internalColumnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: onSortingChange ?? setInternalSorting,
    onColumnFiltersChange: onColumnFiltersChange ?? setInternalColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    ...(manualFiltering ? {} : { getFilteredRowModel: getFilteredRowModel() }),
    // Pagination is always server-driven across the dashboard modules.
    manualPagination: true,
    manualSorting,
    manualFiltering,
    pageCount: pagination.totalPages,
    rowCount: pagination.total,
  })

  return (
    <div
      className={cn(
        // Add margin bottom to the table on mobile when the toolbar is visible
        'max-sm:has-[div[role="toolbar"]]:mb-16',
        'flex flex-1 flex-col gap-4'
      )}
    >
      <DataTableToolbar
        table={table}
        searchPlaceholder={searchPlaceholder}
        searchKey={searchKey}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        filters={filters}
      />
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header) => (
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
                ))}
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
                  {emptyMessage}
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
      {bulkActions?.(table)}
    </div>
  )
}
