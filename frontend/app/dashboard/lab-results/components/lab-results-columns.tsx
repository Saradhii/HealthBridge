'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { statusColors } from '../data/data'
import { type LabResult } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { format } from 'date-fns'
import { Calendar } from 'lucide-react'

export const labResultsColumns: ColumnDef<LabResult>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    meta: {
      className: cn('max-md:sticky start-0 z-10 rounded-tl-[inherit]'),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'patientName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Patient' />
    ),
    cell: ({ row }) => {
      const { patient } = row.original
      const fullName = `${patient.firstName} ${patient.lastName}`
      return <LongText className='max-w-48 ps-3'>{fullName}</LongText>
    },
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'ps-0.5 max-md:sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none'
      ),
    },
    enableHiding: false,
  },
  {
    accessorKey: 'testName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Test' />
    ),
    cell: ({ row }) => {
      const testName = row.getValue('testName') as string
      const { category } = row.original
      return (
        <div className='flex flex-col gap-0.5'>
          <span className='text-sm font-medium'>{testName}</span>
          {category && (
            <span className='text-xs text-muted-foreground'>{category}</span>
          )}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    id: 'result',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Result' />
    ),
    cell: ({ row }) => {
      const { resultValue, unit, referenceRange } = row.original
      if (!resultValue) {
        return <span className='text-sm text-muted-foreground'>Pending</span>
      }
      return (
        <div className='flex flex-col gap-0.5'>
          <span className='text-sm'>
            {resultValue}
            {unit ? ` ${unit}` : ''}
          </span>
          {referenceRange && (
            <span className='text-xs text-muted-foreground'>
              Ref: {referenceRange}
            </span>
          )}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const { status } = row.original
      const badgeColor = statusColors.get(status)
      return (
        <div className='flex space-x-2'>
          <Badge variant='outline' className={cn('capitalize', badgeColor)}>
            {status.replace('_', ' ')}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    id: 'orderedByName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ordered By' />
    ),
    cell: ({ row }) => {
      const { orderedBy } = row.original
      return <div className='text-sm'>{orderedBy?.name || '-'}</div>
    },
    enableSorting: false,
  },
  {
    accessorKey: 'orderedDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ordered' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('orderedDate') as Date
      return (
        <div className='flex items-center gap-1.5 text-sm'>
          <Calendar size={14} className='text-muted-foreground' />
          <span>{format(date, 'MMM dd, yyyy')}</span>
        </div>
      )
    },
    meta: { className: 'w-36' },
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
